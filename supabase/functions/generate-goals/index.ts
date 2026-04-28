import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goal_type, current_value, deadline, healthData } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use specified OpenRouter model
    const models = [
      "openai/gpt-oss-20b:free"
    ];

    let lastError: Error | null = null;
    let response: Response | null = null;

    for (const model of models) {
      try {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://healthtrack.app",
            "X-Title": "HealthTrack",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: getSystemPrompt(!!deadline),
              },
              {
                role: "user",
                content: buildGoalPrompt(goal_type, current_value, deadline, healthData),
              },
            ],
          }),
        });

        if (response.ok) {
          break; // Success, exit the loop
        }

        // Handle specific error codes
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ error: "Unauthorized. Please check your OpenRouter API key." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required. Please add credits to your OpenRouter account." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (response.status === 400) {
          return new Response(
            JSON.stringify({ error: "Bad request. Please check your input data." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // If not ok and not a specific error we handled, try next model
        const errorText = await response.text();
        console.error(`Model ${model} failed:`, response.status, errorText);
        lastError = new Error(`Model ${model} failed: ${response.status} - ${errorText}`);
        
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        lastError = error;
      }
    }

    if (!response || !response.ok) {
      const errorMsg = lastError ? lastError.message : "All AI models failed";
      console.error("AI gateway error:", errorMsg);
      return new Response(
        JSON.stringify({ error: `AI gateway error: ${errorMsg}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // Parse the JSON response - try multiple extraction methods
    const parseResult = extractJSON(content, goal_type, !deadline);
    
    if (!parseResult.success) {
      console.error("Failed to parse AI response:", content.substring(0, 200));
      return new Response(
        JSON.stringify({ error: `Invalid plan format from AI. Please try again.` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(parseResult.data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in generate-goals:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getSystemPrompt(isPlanMode: boolean): string {
  if (!isPlanMode) {
    return `You are a health advisor API. You MUST return ONLY valid JSON.
CRITICAL RULES:
- Return ONLY raw JSON, no markdown, no explanations, no preamble, no code blocks
- Do not wrap in \`\`\`json or any other formatting
- Your entire response must be parseable by JSON.parse()
- Return format: {"suggested_target": number, "reasoning": string}`;
  }
  
  return `You are a health advisor API. You MUST return ONLY valid JSON.
CRITICAL RULES:
- Return ONLY raw JSON, no markdown, no explanations, no preamble, no code blocks
- Do not wrap in \`\`\`json or any other formatting
- Your entire response must be parseable by JSON.parse()
- Generate a day-wise plan with days as keys
- Each day must have: food, exercise, activities, reminder
- Return format: {"Day 1": {"food": "...", "exercise": "...", "activities": "...", "reminder": "..."}}`;
}

function extractJSON(content: string, goal_type: string, isTargetMode: boolean): { success: boolean; data: any } {
  let suggested_target: number | null = null;
  let plan: any = null;
  
  try {
    // Method 1: Try parsing the entire content as JSON
    const parsed = JSON.parse(content);
    if (parsed.suggested_target !== undefined) {
      suggested_target = parseFloat(parsed.suggested_target);
      return { success: true, data: { suggested_target, plan: {} } };
    }
    if (Object.keys(parsed).some(k => k.startsWith("Day"))) {
      return { success: true, data: { plan: parsed } };
    }
    return { success: true, data: { plan: parsed } };
  } catch {
    // Continue to other methods
  }
  
  // Method 2: Try extracting JSON from markdown code blocks
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (parsed.suggested_target !== undefined) {
        suggested_target = parseFloat(parsed.suggested_target);
        return { success: true, data: { suggested_target, plan: {} } };
      }
      return { success: true, data: { plan: parsed } };
    } catch {
      // Continue
    }
  }
  
  // Method 3: Try extracting JSON object with braces
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.suggested_target !== undefined) {
        suggested_target = parseFloat(parsed.suggested_target);
        return { success: true, data: { suggested_target, plan: {} } };
      }
      return { success: true, data: { plan: parsed } };
    } catch {
      // Continue
    }
  }
  
  // Method 4: For target mode, try extracting just a number
  if (isTargetMode) {
    const numberMatch = content.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      suggested_target = parseFloat(numberMatch[1]);
      return { success: true, data: { suggested_target, plan: {} } };
    }
  }
  
  return { success: false, data: null };
}

function buildGoalPrompt(goal_type: string, current_value: number, deadline: string, healthData: any): string {
  let prompt = `Goal Type: ${goal_type}\n`;
  if (current_value) prompt += `Current Value: ${current_value}\n`;
  if (deadline) prompt += `Deadline: ${deadline}\n`;
  if (healthData) {
    prompt += `Health Data: Age ${healthData.age}, BMI ${healthData.bmi}, Weight ${healthData.weight}kg, Exercise ${healthData.exercise_frequency}, Diet ${healthData.diet_type}\n`;
  }
  
  // If no deadline is provided, this is likely a target generation request
  if (!deadline) {
    prompt += `Based on the user's health data and current status, suggest a realistic target value for this goal.
Return ONLY a JSON object: {"suggested_target": <number>, "reasoning": "brief explanation"}`;
  } else {
    prompt += `Generate a detailed day-wise plan for this goal. Include:
- Daily food recommendations with calorie estimates
- Exercise routines
- Daily activities and habits
- Progress tracking tips
- Reminders for each day
Return ONLY a JSON object: {"Day 1": {"food": "...", "exercise": "...", "activities": "...", "reminder": "..."}}`;
  }
  return prompt;
}

