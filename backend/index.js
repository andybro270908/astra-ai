import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import fs from "fs";

import { handleAgent } from "./agent.js";
import { readPDF } from "./tools.js";
import cloudinary from "./cloudinary.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const sessions = {};
const MAX_HISTORY = 10;

function getSession(id) {
  if (!sessions[id]) sessions[id] = [];
  return sessions[id];
}

function addMessage(id, role, content) {
  const s = getSession(id);
  s.push({ role, content });
  if (s.length > MAX_HISTORY) s.shift();
}

/* SESSION */
app.use((req, res, next) => {
  let id = req.headers["x-session-id"];
  if (!id) id = uuidv4();

  req.sessionId = id;
  res.setHeader("x-session-id", id);
  next();
});

/* TEST */
app.get("/", (req, res) => {
  res.json({ status: "Astra running" });
});

/* CHAT */
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const id = req.sessionId;

  addMessage(id, "user", message);

  const reply = await handleAgent(message, getSession(id), res);

  if (reply !== null) {
    addMessage(id, "assistant", reply);
    res.json({ reply });
  }
});

/* FILE UPLOAD */
app.post("/upload", upload.single("file"), async (req, res) => {
  const result = await cloudinary.uploader.upload(req.file.path, {
    resource_type: "auto"
  });

  res.json({ url: result.secure_url });
});

/* PDF READ */
app.post("/read-pdf", upload.single("file"), async (req, res) => {
  const buffer = fs.readFileSync(req.file.path);
  const text = await readPDF(buffer);

  res.json({ text });
});

app.listen(5000, () => {
  console.log("🚀 Astra running");
});
