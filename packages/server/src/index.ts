import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (_, res) => {
  res.send("Splendor server running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
