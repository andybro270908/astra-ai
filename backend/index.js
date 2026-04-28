import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { runAI } from "./aiRouter.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================
   🧠 MEMORY (RAM ONLY)
========================= */

const sessions = {};
const MAX_HISTORY = 20;

function getSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }
  return sessions[sessionId];
}

function addMessage(sessionId, role, content) {
  const session = getSession(sessionId);

  session.push({ role, content });

  // Keep memory small (important for performance)
  if (session.length > MAX_HISTORY) {
    session.shift();
  }
}

/* =========================
   🔑 SESSION HANDLER
========================= */

app.use((req, res, next) => {
  let sessionId = req.headers["x-session-id"];

  if (!sessionId) {
    sessionId = uuidv4();
  }

  req.sessionId = sessionId;
  res.setHeader("x-session-id", sessionId);

  next();
});

/* =========================
   🧪 HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.json({ status: "Astra AI running" });
});

/* =========================
   🤖 CHAT ENDPOINT
========================= */

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const sessionId = req.sessionId;

  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  // Save user message
  addMessage(sessionId, "user", message);

  try {
    const history = getSession(sessionId);

    // Call AI Router
    const reply = await runAI(history);

    // Save AI reply
    addMessage(sessionId, "assistant", reply);

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.json({ reply: "⚠️ Astra encountered an error." });
  }
});

/* =========================
   🚀 START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`🚀 Astra running on port ${PORT}`);
});
