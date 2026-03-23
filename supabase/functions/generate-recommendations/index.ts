import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { healthData, logs, goals } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context for AI
    const context = buildHealthContext(healthData, logs, goals);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "stepfun/step-3.5-flash:free",
        messages: [
          {
            role: "system",
            content: "You are a professional health advisor. Provide personalized, actionable health recommendations based on the user's health data. Focus on diet, exercise, and lifestyle changes. Be supportive and encouraging. Keep recommendations specific and practical.",
          },
          {
            role: "user",
            content: context,
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid AI response structure");
    }
    const recommendations = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in generate-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildHealthContext(healthData: any, logs: any[], goals: any[]): string {
  let context = `Health Profile:\n`;
  context += `- Age: ${healthData.age}\n`;
  context += `- Gender: ${healthData.gender}\n`;
  context += `- BMI: ${healthData.bmi?.toFixed(1)}\n`;
  context += `- Current Weight: ${healthData.weight} kg\n\n`;

  context += `Risk Assessment:\n`;
  context += `- Diabetes Risk: ${healthData.diabetes_risk}%\n`;
  context += `- Obesity Risk: ${healthData.obesity_risk}%\n`;
  context += `- Hypertension Risk: ${healthData.hypertension_risk}%\n\n`;

  context += `Lifestyle:\n`;
  context += `- Exercise: ${healthData.exercise_frequency}\n`;
  context += `- Diet Type: ${healthData.diet_type}\n`;
  context += `- Smoking: ${healthData.smoking_status}\n`;
  context += `- Alcohol: ${healthData.alcohol_consumption}\n`;
  context += `- Sleep: ${healthData.sleep_hours} hours\n\n`;

  if (logs && logs.length > 0) {
    context += `Recent Health Logs (last ${logs.length} days):\n`;
    logs.forEach((log: any) => {
      context += `- ${log.log_date}: Weight ${log.weight}kg`;
      if (log.blood_pressure_systolic) {
        context += `, BP ${log.blood_pressure_systolic}/${log.blood_pressure_diastolic}`;
      }
      if (log.exercise_minutes) {
        context += `, Exercise ${log.exercise_minutes}min`;
      }
      context += `\n`;
    });
    context += `\n`;
  }

  if (goals && goals.length > 0) {
    context += `Health Goals:\n`;
    goals.forEach((goal: any) => {
      context += `- ${goal.goal_type}: Target ${goal.target_value}`;
      if (goal.current_value) {
        context += ` (Current: ${goal.current_value})`;
      }
      context += `\n`;
    });
    context += `\n`;
  }

  context += `Please provide personalized recommendations for:\n`;
  context += `1. Diet and nutrition\n`;
  context += `2. Exercise and physical activity\n`;
  context += `3. Lifestyle improvements\n`;
  context += `Focus on the highest risk areas and be specific with actionable steps.`;

  return context;
}
