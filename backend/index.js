import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ status: "Astra AI backend running" });
});

app.listen(5000, () => {
  console.log("Server running...");
});
