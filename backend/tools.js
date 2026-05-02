import fetch from "node-fetch";
import PDFDocument from "pdfkit";
import pdfParse from "pdf-parse";

/* 🔢 CALCULATOR */
export function calculate(input) {
  try {
    return `💰 Result: ${Function(`"use strict";return(${input})`)()}`;
  } catch {
    return null;
  }
}

/* 🌐 WEB SEARCH */
export async function webSearch(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.AbstractText) return data.AbstractText;

  return data.RelatedTopics?.slice(0, 5)
    .map(r => r.Text)
    .join("\n") || "No data found.";
}

/* 📄 PDF GENERATOR */
export function generatePDF(text, res) {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=astra-report.pdf");

  doc.pipe(res);
  doc.text(text);
  doc.end();
}

/* 📖 PDF READER */
export async function readPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text.slice(0, 2000);
}
