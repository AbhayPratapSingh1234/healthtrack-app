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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-nano-9b-v2:free",
        messages: [
          {
            role: "system",
            content: "You are a health advisor. Generate a detailed day-wise plan for the user's goal based on their health data. Structure the response as a valid JSON object with days as keys, each containing 'food', 'exercise', 'activities', and 'reminder' fields. Ensure the plan is realistic and achievable.",
          },
          {
            role: "user",
            content: buildGoalPrompt(goal_type, current_value, deadline, healthData),
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse the JSON plan
    let plan;
    try {
      plan = JSON.parse(content);
    } catch (e) {
      // If not valid JSON, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid plan format from AI");
      }
    }

    return new Response(
      JSON.stringify({ plan }),
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

function buildGoalPrompt(goal_type: string, current_value: number, deadline: string, healthData: any): string {
  let prompt = `Goal Type: ${goal_type}\n`;
  if (current_value) prompt += `Current Value: ${current_value}\n`;
  if (deadline) prompt += `Deadline: ${deadline}\n`;
  if (healthData) {
    prompt += `Health Data: Age ${healthData.age}, BMI ${healthData.bmi}, Weight ${healthData.weight}kg, Exercise ${healthData.exercise_frequency}, Diet ${healthData.diet_type}\n`;
  }
  prompt += `Generate a detailed day-wise plan for this goal. Include:
  - Daily food recommendations with calorie estimates
  - Exercise routines
  - Daily activities and habits
  - Progress tracking tips
  - Reminders for each day
  Structure the response as a JSON object with days as keys, each containing food, exercise, activities, and reminder fields.
  Example: {"Day 1": {"food": "Breakfast: Oatmeal (300 cal), Lunch: Chicken salad (500 cal)", "exercise": "30 min walk", "activities": "Drink 8 glasses water", "reminder": "Weigh yourself in morning"}}`;
  return prompt;
}
