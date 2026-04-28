import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { handleAgent } from "./agent.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================
   🧠 MEMORY
========================= */
const sessions = {};
const MAX_HISTORY = 20;

function getSession(id) {
  if (!sessions[id]) sessions[id] = [];
  return sessions[id];
}

function addMessage(id, role, content) {
  const session = getSession(id);
  session.push({ role, content });

  if (session.length > MAX_HISTORY) {
    session.shift();
  }
}

/* =========================
   🔑 SESSION
========================= */
app.use((req, res, next) => {
  let sessionId = req.headers["x-session-id"];
  if (!sessionId) sessionId = uuidv4();

  req.sessionId = sessionId;
  res.setHeader("x-session-id", sessionId);

  next();
});

/* =========================
   🧪 TEST
========================= */
app.get("/", (req, res) => {
  res.json({ status: "Astra AI running" });
});

/* =========================
   🤖 CHAT (AGENT POWERED)
========================= */
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const id = req.sessionId;

  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  addMessage(id, "user", message);

  try {
    const history = getSession(id);

    const reply = await handleAgent(message, history);

    addMessage(id, "assistant", reply);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "⚠️ Astra error." });
  }
});

/* =========================
   🚀 START
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Astra running on port ${PORT}`);
});
