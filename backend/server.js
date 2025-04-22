// backend/server.js

const express = require('express');
const app = express();
const PORT = 5000;

app.get('/api/ping', (req, res) => {
  res.json({ message: "Pong from backend 💥" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
