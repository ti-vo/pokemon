// scripts/import-pokemon.js
// One-time import: fetches the first 20 Pokemon from the PokeAPI and writes
// their base data into the local `pokemon` table, including a computed
// catch_rate derived from base_experience (rarer/stronger -> harder to catch).
//
// Run with: npm run import   (or: node scripts/import-pokemon.js)
// Safe to re-run: existing rows are updated (upsert), no duplicates created.

const db = require("../db");

const POKEAPI_BASE = "https://pokeapi.co/api/v2/pokemon";
const START_ID = 1;
const END_ID = 20;

// Maps base_experience to a catch_rate between MIN_RATE (hard) and
// MAX_RATE (easy). Values are clamped so every Pokemon stays catchable.
const MIN_RATE = 0.2;
const MAX_RATE = 0.85;
// Rough upper bound of base_experience among early-game Pokemon, used to
// normalize the scale. Anything at or above this gets the minimum rate.
const EXPERIENCE_CEILING = 250;

function calculateCatchRate(baseExperience) {
  const clampedExperience = Math.min(baseExperience, EXPERIENCE_CEILING);
  const normalized = clampedExperience / EXPERIENCE_CEILING; // 0 (weak) .. 1 (strong)
  const rate = MAX_RATE - normalized * (MAX_RATE - MIN_RATE);
  return Math.round(rate * 100) / 100; // round to 2 decimals
}

async function fetchPokemon(id) {
  const response = await fetch(`${POKEAPI_BASE}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch pokemon ${id}: ${response.status}`);
  }
  return response.json();
}

const upsertStatement = db.prepare(`
  INSERT INTO pokemon (id, name, sprite_url, types, catch_rate)
  VALUES (@id, @name, @sprite_url, @types, @catch_rate)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    sprite_url = excluded.sprite_url,
    types = excluded.types,
    catch_rate = excluded.catch_rate
`);

async function run() {
  console.log(`Importing Pokemon ${START_ID}-${END_ID} from the PokeAPI...`);

  for (let id = START_ID; id <= END_ID; id++) {
    const data = await fetchPokemon(id);

    const name = data.name;
    const spriteUrl = data.sprites?.front_default || null;
    const types = data.types.map((t) => t.type.name).join(",");
    const catchRate = calculateCatchRate(data.base_experience || 0);

    upsertStatement.run({
      id,
      name,
      sprite_url: spriteUrl,
      types,
      catch_rate: catchRate,
    });

    console.log(
      `  #${id} ${name} — base_experience=${data.base_experience}, catch_rate=${catchRate}`
    );
  }

  console.log("Import complete.");
}

run().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
