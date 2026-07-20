// server.js
// Express entry point. Wires up middleware and routes.

const express = require("express");
const cors = require("cors");
const pokemonRoutes = require("./routes/pokemon");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/pokemon", pokemonRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
