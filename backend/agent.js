import { calculate, webSearch, generatePDF } from "./tools.js";
import { runAI } from "./aiRouter.js";

function detectIntent(msg) {
  msg = msg.toLowerCase();

  if (/^[0-9+\-*/(). ]+$/.test(msg)) return "math";
  if (msg.includes("research")) return "research";
  if (msg.includes("report")) return "report";
  if (msg.includes("news")) return "web";

  return "chat";
}

async function agentLoop(message, history) {
  let context = "";

  // Step 1: search
  context = await webSearch(message);

  // Step 2: analyze
  return await runAI([
    ...history,
    {
      role: "user",
      content: `Using this data:\n${context}\nAnswer:\n${message}`
    }
  ]);
}

export async function handleAgent(message, history, res) {
  const intent = detectIntent(message);

  if (intent === "math") {
    return calculate(message);
  }

  if (intent === "web") {
    return await webSearch(message);
  }

  if (intent === "research") {
    const result = await agentLoop(message, history);
    return `📚 Research:\n\n${result}`;
  }

  if (intent === "report") {
    const result = await agentLoop(message, history);
    generatePDF(result, res);
    return null;
  }

  return await runAI(history);
}
