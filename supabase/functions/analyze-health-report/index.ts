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
    const { fileData, fileName, fileType } = await req.json();

    if (!fileData) {
      throw new Error("No file data provided");
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing health report:", fileName, fileType);

    // Prepare the request based on file type
    let messages;
    
    if (fileType.startsWith("image/")) {
      // For images (x-rays, scans, etc.)
      messages = [
        {
          role: "system",
          content: `You are a Doctor AI Report Expert. Your task is to analyze the uploaded health report image and extract the ACTUAL test values shown in the report.

CRITICAL: You MUST extract the real values from THIS SPECIFIC report, not generic or typical values. Look at the image and read the actual numbers and parameters.

Return your response as a JSON object with this EXACT structure:
{
  "comparisonTable": [
    {
      "parameter": "Exact Test/Parameter Name from the report",
      "reportValue": "Exact value shown in the report (e.g., '120 mg/dL', '3.5 mmol/L')",
      "normalRange": "Standard normal healthy range for this parameter",
      "status": "Normal|High|Low|Critical",
      "effect": "Brief impact (1 line max)"
    }
  ],
  "summary": "2-3 sentence overview of this patient's actual results",
  "majorDisease": "The most critical health condition identified from the abnormal values (e.g., 'Diabetes Mellitus' or 'Hypertension')",
  "potentialDiagnoses": ["Diagnosis 1", "Diagnosis 2"],
  "majorConcerns": ["Critical finding 1", "Critical finding 2"],
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "specialistConsultations": ["Specialist 1", "Specialist 2"],
  "precautions": ["Precaution 1", "Precaution 2", "Precaution 3"]
}

RULES:
- ONLY use values that are actually visible in the uploaded report image
- Do NOT invent or use generic/typical values
- Extract ALL measurable parameters you can read from the image
- Compare each actual report value with standard normal ranges
- Status: Normal (within range), High (above range), Low (below range), or Critical (severely abnormal)
- Effect: ONE line explaining health impact of this specific value
- Focus on abnormal values in the analysis
- Use simple language
- potentialDiagnoses: List specific illnesses/conditions this patient might have based on their actual abnormal values, including brief causes (e.g., "Type 2 Diabetes Risk (elevated blood glucose)", "Vitamin D Deficiency (low vitamin D levels)", "Hypertension (high blood pressure)")
- majorConcerns: List the critical abnormal findings from this report and their immediate risks
- specialistConsultations: List specific medical specialists this patient should consult based on their results
- precautions: List specific preventive measures and lifestyle changes this patient should follow based on their results`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Look at this health report image. Extract the actual test values shown in this specific report, then compare each one with normal ranges. Return as JSON with the exact values from the image."
            },
            {
              type: "image_url",
              image_url: {
                url: fileData
              }
            }
          ]
        }
      ];
    } else {
      // For PDFs or other documents
      messages = [
        {
          role: "system",
          content: `You are a Doctor AI Report Expert. Based on the document type, provide a guide about typical values and comparisons.

Return your response as a JSON object with this structure:
{
  "comparisonTable": [
    {
      "parameter": "Common test name",
      "reportValue": "Typical value",
      "normalRange": "Normal range",
      "status": "Normal",
      "effect": "What this measures"
    }
  ],
  "summary": "What this report type typically contains",
  "majorConcerns": ["What to look for", "Common issues"],
  "recommendations": ["How to read it", "What to check", "Next steps"]
}`
        },
        {
          role: "user",
          content: `I've uploaded a health report file named "${fileName}". Provide typical values and normal ranges for this type of report as JSON.`
        }
      ];
    }

    // Call Lovable AI Gateway with retry logic
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (response.status === 429) {
          console.log(`Rate limited, attempt ${attempt + 1}/${maxRetries}`);
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            continue;
          }
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI API error:", response.status, errorText);
          throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        let analysisContent = data.choices?.[0]?.message?.content;

        if (!analysisContent) {
          throw new Error("No analysis generated");
        }

        // Try to parse JSON response
        let analysisData;
        try {
          // Remove markdown code blocks if present
          analysisContent = analysisContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          analysisData = JSON.parse(analysisContent);
        } catch (parseError) {
          console.error("Failed to parse JSON, returning raw content:", parseError);
          // Fallback to raw content if JSON parsing fails
          // Remove table separator lines before setting rawAnalysis
          let lines = analysisContent.split('\n');
          lines = lines.filter(line => !line.trim().match(/^[\s\|:-]+$/));
          analysisContent = lines.join('\n');
          analysisData = { rawAnalysis: analysisContent };
        }

        return new Response(
          JSON.stringify({ analysis: analysisData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error("Failed to analyze report after retries");

  } catch (error: unknown) {
    console.error("Error in analyze-health-report function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze report";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
