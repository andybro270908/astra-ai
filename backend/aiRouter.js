import fetch from "node-fetch";

const { GROQ_API_KEY, GEMINI_API_KEY } = process.env;

/* =========================
   🚀 GROQ (PRIMARY)
========================= */
async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

/* =========================
   🔁 GEMINI (FALLBACK)
========================= */
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
  return data.candidates[0].content.parts[0].text;
}

/* =========================
   🧠 ROUTER
========================= */
export async function runAI(messages) {
  try {
    return await callGroq(messages);
  } catch (e) {
    console.log("Groq failed → Gemini");
  }

  try {
    return await callGemini(messages);
  } catch (e) {
    console.log("Gemini failed");
  }

  return "⚠️ AI services unavailable.";
                }
