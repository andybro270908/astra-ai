import fetch from "node-fetch";

const { GROQ_API_KEY, GEMINI_API_KEY } = process.env;

const systemPrompt = {
  role: "system",
  content: "You are Astra AI, a futuristic intelligent assistant. Be clear, structured and helpful."
};

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [systemPrompt, ...messages]
    })
  });

  const data = await res.json();
  if (!data.choices) throw new Error();
  return data.choices[0].message.content;
}

async function callGemini(messages) {
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await res.json();
  if (!data.candidates) throw new Error();
  return data.candidates[0].content.parts[0].text;
}

export async function runAI(messages) {
  try {
    return await callGroq(messages);
  } catch {
    return await callGemini(messages);
  }
}
