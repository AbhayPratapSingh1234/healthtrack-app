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
    const { type, input } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    
    if (type === "illness") {
      systemPrompt = `You are a medical assistant. Given a partial illness name or description, suggest 5 most relevant medical conditions or illnesses. Return ONLY a JSON array of strings. Example: ["Diabetes Type 2", "Asthma", "Hypertension", "Arthritis", "Migraine"]`;
    } else if (type === "symptom") {
      systemPrompt = `You are a medical assistant. Given a partial symptom description, suggest 5 most common related symptoms. Return ONLY a JSON array of strings. Example: ["Fever", "Headache", "Fatigue", "Nausea", "Cough"]`;
    } else if (type === "allergy") {
      systemPrompt = `You are a medical assistant. Given a partial allergy name, suggest 5 most common allergies. Return ONLY a JSON array of strings. Example: ["Peanuts", "Dairy", "Pollen", "Dust mites", "Pet dander"]`;
    } else if (type === "location") {
      systemPrompt = `You are a geographical assistant. Given a partial location name, suggest 5 most relevant cities or places in India. Return ONLY a JSON array of strings. Example: ["Mumbai, Maharashtra", "Delhi", "Bangalore, Karnataka", "Chennai, Tamil Nadu", "Kolkata, West Bengal"]`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-4b-it:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input || "suggest common options" }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 400) {
        return new Response(
          JSON.stringify({ error: "Bad request. Please check your input." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Unauthorized. Please check your API key." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      console.error("Error details:", errorText);
      console.error("Request payload:", JSON.stringify({
        model: "qwen/qwen-2.5-72b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input || "suggest common options" }
        ],
      }, null, 2));
      throw new Error(`Failed to get response from AI: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid response structure from AI");
    }
    const reply = data.choices[0].message.content;

    // Parse the JSON array from the response
    let suggestions: string[] = [];
    try {
      // First try to parse the entire response as JSON
      suggestions = JSON.parse(reply);
    } catch (e) {
      try {
        // If that fails, try to extract JSON array from the response
        const jsonMatch = reply.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, split by commas and clean up
          suggestions = reply.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      } catch (e2) {
        console.error("Failed to parse suggestions:", reply);
        suggestions = [];
      }
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in health-suggestions:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
