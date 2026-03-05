export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const systemPrompt = `You are an instructional coach for a decision-making course. Provide concise, supportive feedback.
Return JSON only with keys: feedback (string), options (array of 2-3 strings), video_query (string).
Make feedback specific to the student's tool/concept/why and the scenario stakes.
Options should be actionable next-step choices.`;

    const userPrompt = JSON.stringify(payload);

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: env.MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!openAiResponse.ok) {
      const errText = await openAiResponse.text();
      return new Response(JSON.stringify({ error: "OpenAI request failed", details: errText }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const data = await openAiResponse.json();
    const content = data?.choices?.[0]?.message?.content || "{}";

    return new Response(content, {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};
