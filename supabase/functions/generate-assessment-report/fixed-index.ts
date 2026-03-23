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
    const API_KEY = Deno.env.get("OPENAI_API_KEY");
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const MODEL = "arcee-ai/trinity-large-preview:free";
    
    console.log("🎯 Arcee AI call:", { hasKey: !!API_KEY });
    
    if (!API_KEY) {
      throw new Error("OPENAI_API_KEY missing");
    }

    const systemPrompt = `You are a medical AI assistant. Generate STRICT JSON health report.

JSON ONLY:
{
  "title": "Health Assessment Report",
  "potentialHealthRisks": [{"name": "", "riskLevel": "HIGH", "description": ""}],
  "preventionStrategies": [{"category": "", "items": []}],
  "personalizedRecommendations": [{"title": "", "description": ""}],
  "dietaryRecommendations": {
    "foodsToAvoid": [],
    "foodsToInclude": [],
    "suggestedMealPlan": {"breakfast": "", "lunch": "", "dinner": "", "snacks": ""}
  },
  "disclaimer": "Consult doctor."
}`;

    const userPrompt = `Profile: Age: ${assessmentData.age}, BMI: ${assessmentData.bmi}, Diabetes Risk: ${assessmentData.diabetes_risk}%`;

    const aiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
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
