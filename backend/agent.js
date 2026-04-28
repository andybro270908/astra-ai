import { calculate, webSearch } from "./tools.js";
import { runAI } from "./aiRouter.js";

/* =========================
   🧠 INTENT DETECTION
========================= */
function detectIntent(message) {
  const msg = message.toLowerCase();

  if (/^[0-9+\-*/(). ]+$/.test(msg)) return "math";
  if (msg.includes("research")) return "research";
  if (msg.includes("news") || msg.includes("latest")) return "web";

  return "chat";
}

/* =========================
   🤖 AGENT LOGIC
========================= */
export async function handleAgent(message, history) {
  const intent = detectIntent(message);

  // 🔢 CALCULATOR
  if (intent === "math") {
    const result = calculate(message);
    if (result) return result;
  }

  // 🌐 WEB SEARCH
  if (intent === "web") {
    const data = await webSearch(message);
    return `🌐 Web Result:\n${data}`;
  }

  // 🧠 RESEARCH MODE (multi-step)
  if (intent === "research") {
    const searchData = await webSearch(message);

    const prompt = [
      ...history,
      {
        role: "user",
        content: `Summarize and structure this:\n${searchData}`
      }
    ];

    const aiResponse = await runAI(prompt);

    return `📚 Research Summary:\n\n${aiResponse}`;
  }

  // 🤖 DEFAULT → AI
  return await runAI(history);
}
