import fetch from "node-fetch";

/* =========================
   🔢 CALCULATOR
========================= */
export function calculate(input) {
  try {
    // Safe eval (basic)
    const result = eval(input);
    return `🧮 Result: ${result}`;
  } catch {
    return null;
  }
}

/* =========================
   🌐 WEB SEARCH
========================= */
export async function webSearch(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.AbstractText) return data.AbstractText;

  const related = data.RelatedTopics?.slice(0, 3)
    .map(t => t.Text)
    .join("\n");

  return related || "No useful results found.";
}
