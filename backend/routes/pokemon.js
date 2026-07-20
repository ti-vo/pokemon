// routes/pokemon.js
// GET  /api/pokemon           -> list all pokemon with their current catch status
// POST /api/pokemon/:id/catch -> attempt to catch a pokemon (random roll against catch_rate)

const express = require("express");
const db = require("../db");

const router = express.Router();

// Ensure every pokemon has a corresponding catches row (attempts=0, caught=0)
// so the join below always returns a status, even before any attempt was made.
function ensureCatchRow(pokemonId) {
  const existing = db
    .prepare("SELECT id FROM catches WHERE pokemon_id = ?")
    .get(pokemonId);

  if (!existing) {
    db.prepare(
      "INSERT INTO catches (pokemon_id, caught, attempts) VALUES (?, 0, 0)"
    ).run(pokemonId);
  }
}

// GET /api/pokemon
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT
         p.id,
         p.name,
         p.sprite_url,
         p.types,
         p.catch_rate,
         COALESCE(c.caught, 0) AS caught,
         COALESCE(c.attempts, 0) AS attempts,
         c.caught_at
       FROM pokemon p
       LEFT JOIN catches c ON c.pokemon_id = p.id
       ORDER BY p.id ASC`
    )
    .all();

  const result = rows.map((row) => ({
    id: row.id,
    name: row.name,
    spriteUrl: row.sprite_url,
    types: row.types ? row.types.split(",") : [],
    caught: !!row.caught,
    attempts: row.attempts,
    caughtAt: row.caught_at,
  }));

  res.json(result);
});

// POST /api/pokemon/:id/catch
router.post("/:id/catch", (req, res) => {
  const pokemonId = Number(req.params.id);

  const pokemon = db
    .prepare("SELECT * FROM pokemon WHERE id = ?")
    .get(pokemonId);

  if (!pokemon) {
    return res.status(404).json({ error: "Pokemon not found" });
  }

  ensureCatchRow(pokemonId);

  const catchRow = db
    .prepare("SELECT * FROM catches WHERE pokemon_id = ?")
    .get(pokemonId);

  if (catchRow.caught) {
    return res.status(400).json({ error: "Pokemon is already caught" });
  }

  const roll = Math.random();
  const success = roll < pokemon.catch_rate;

  if (success) {
    db.prepare(
      `UPDATE catches
       SET caught = 1, attempts = attempts + 1, caught_at = CURRENT_TIMESTAMP
       WHERE pokemon_id = ?`
    ).run(pokemonId);
  } else {
    db.prepare(
      `UPDATE catches SET attempts = attempts + 1 WHERE pokemon_id = ?`
    ).run(pokemonId);
  }

  res.json({
    success,
    catchRate: pokemon.catch_rate,
    roll,
  });
});

module.exports = router;
