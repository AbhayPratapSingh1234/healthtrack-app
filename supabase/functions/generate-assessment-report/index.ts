import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST allowed" }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  let assessmentData;
  let api = 'openai';
  
  try {
    const body = await req.json();
    assessmentData = body.assessmentData;
    api = body.api || 'openai';
    console.log("📥 Payload received:", { assessmentDataKeys: Object.keys(assessmentData) });
    
    if (!assessmentData || typeof assessmentData !== 'object') {
      throw new Error("Missing or invalid 'assessmentData' object");
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const API_KEY = Deno.env.get("OPENROUTER_API_KEY") || Deno.env.get("OPENAI_API_KEY");
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    const MODEL = "arcee-ai/trinity-large-preview:free";
    
    console.log("🌐 OpenRouter call:", MODEL, { hasKey: !!API_KEY });
    
    if (!API_KEY) {
      throw new Error("OPENROUTER_API_KEY or OPENAI_API_KEY missing");
    }

    const systemPrompt = `You are medical AI. Generate STRICT JSON report with 4-6 potential diseases based on ALL assessment data provided.

MANDATORY FORMAT (no extra text):
{
  "title": "Personalized Health Risk Assessment",
  "subtitle": "Comprehensive Disease Risk Analysis",
  "potentialHealthRisks": [
    {"name": "Type 2 Diabetes", "riskLevel": "HIGH|MEDIUM|LOW", "description": "Detailed explanation why + complications"},
    {"name": "Hypertension", "riskLevel": "HIGH|MEDIUM|LOW", "description": "..."},
    {"name": "Cardiovascular Disease", "riskLevel": "HIGH|MEDIUM|LOW", "description": "..."},
    {"name": "Obesity-related complications", "riskLevel": "HIGH|MEDIUM|LOW", "description": "..."}
  ],
  "preventionStrategies": [{"category": "Diet", "items": ["Specific advice"]}],
  "personalizedRecommendations": [{"title": "Action Step", "description": "Personalized"}],
  "dietaryRecommendations": {
    "foodsToAvoid": ["List 5-8"],
    "foodsToInclude": ["List 5-8"],
    "suggestedMealPlan": {"breakfast": "", "lunch": "", "dinner": "", "snacks": ""}
  },
  "disclaimer": "Consult healthcare professional."
}

USE ALL DATA: ${JSON.stringify(assessmentData)}
IMPORTANT: 4+ diseases, HIGH/MEDIUM/LOW risks based on BMI, family history, age, lifestyle.
List complications (heart attack, stroke, kidney failure etc) for each disease.`;

    const userPrompt = `Age: ${assessmentData.age} BMI: ${assessmentData.bmi} Diabetes Risk: ${assessmentData.diabetes_risk}%`;

    const aiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Health Report"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    const responseText = await aiResponse.text();
    
    if (!aiResponse.ok) {
      console.error("AI FAILED:", aiResponse.status, responseText);
      return new Response(
        JSON.stringify({ 
          error: `AI Error ${aiResponse.status}`,
          debug: responseText 
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI Response:", responseText.substring(0, 200));

    let report;
    try {
      report = JSON.parse(responseText);
    } catch {
      return new Response(
        JSON.stringify({ 
          error: "AI JSON invalid", 
          debug: responseText 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ report }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("ERROR:", error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        debug: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
