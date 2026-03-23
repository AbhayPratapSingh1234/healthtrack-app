import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, session_id } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const userId = user.id;
    const currentSessionId = session_id || crypto.randomUUID();

    // Save user message to chat history
    const { error: insertError } = await supabase
      .from("chat_history")
      .insert({
        user_id: userId,
        session_id: currentSessionId,
        role: "user",
        content: message,
      });

    if (insertError) {
      console.error("Error saving user message:", insertError);
      // Continue anyway, don't fail the request
    }

    // Load recent chat history (last 20 messages for context)
    const { data: chatHistory, error: historyError } = await supabase
      .from("chat_history")
      .select("role, content")
      .eq("user_id", userId)
      .eq("session_id", currentSessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (historyError) {
      console.error("Error loading chat history:", historyError);
      // Continue with empty history
    }

    const systemPrompt = `You are a health-focused AI assistant. You ONLY answer questions related to health, wellness, fitness, nutrition, medical conditions, mental health, and general wellbeing.

If a user asks anything unrelated to health (like politics, entertainment, technology unrelated to health, etc.), politely refuse and redirect them to ask health-related questions.

Keep your responses concise, helpful, and accurate. Always remind users to consult healthcare professionals for serious medical concerns.

**DOCTOR SUGGESTIONS:**
When users ask for doctor recommendations or healthcare providers:
- Suggest appropriate medical specialties based on their symptoms/conditions
- Recommend consulting primary care physicians first for general concerns
- Suggest specialists only when clearly indicated (e.g., cardiologist for heart issues, dermatologist for skin conditions)
- Always emphasize finding qualified local healthcare providers
- Include general tips for finding good doctors (check credentials, read reviews, consider insurance)

**MEDICATION RECOMMENDATIONS:**
When suggesting medications:
- ONLY recommend over-the-counter (OTC) medications for common, mild conditions
- NEVER suggest prescription medications or dosages
- Always include: "This is not medical advice. Consult a healthcare professional before taking any medication."
- For pain relief: Suggest acetaminophen (Tylenol) or ibuprofen (Advil/Motrin) for mild pain
- For allergies: Suggest antihistamines like loratadine (Claritin) or cetirizine (Zyrtec)
- For colds: Suggest decongestants, antihistamines, or cough syrups
- For digestive issues: Suggest antacids or anti-diarrheals for mild cases
- Always mention potential side effects and when to seek medical attention

**IMPORTANT SAFETY REMINDERS:**
- Never provide diagnoses
- Never suggest stopping prescribed medications
- Always recommend professional medical consultation for persistent or serious symptoms
- Include emergency contact information for urgent situations

You have access to the user's previous conversation history. Use this context to provide more personalized and relevant health advice.`;

    // Build messages array with system prompt, chat history, and current message
    const messages = [
      { role: "system", content: systemPrompt },
      ...(chatHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    };
    const payload = {
      model: "openai/gpt-3.5-turbo",
      messages: messages,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    console.log("OpenRouter response status:", response.status);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your OpenRouter account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      console.error("Error details:", errorText);
      throw new Error(`Failed to get response from AI: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid response structure from AI");
    }
    const reply = data.choices[0].message.content;

    // Save assistant response to chat history
    const { error: saveError } = await supabase
      .from("chat_history")
      .insert({
        user_id: userId,
        session_id: currentSessionId,
        role: "assistant",
        content: reply,
      });

    if (saveError) {
      console.error("Error saving assistant response:", saveError);
      // Continue anyway, don't fail the request
    }

    return new Response(
      JSON.stringify({ reply, session_id: currentSessionId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in health-chatbot:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
