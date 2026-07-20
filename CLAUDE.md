# Pokemon Catch Tracker

## Project Goal
Users see a list of Pokemon and can attempt to catch them.
Clicking "Catch" triggers a random chance based on an individual
catch rate per Pokemon. Progress is persisted.

## Stack
- Backend: Node.js + Express + SQLite (better-sqlite3)
- Frontend: React (Vite)
- External API: PokeAPI (https://pokeapi.co/) — used only for the
  one-time import of base data, not for live requests during operation

## Scope (current phase)
- Initially only the first 20 Pokemon (IDs 1–20)
- Catch mechanic: simple random roll against a catch_rate (0–1)
- No login / no user accounts in this phase

## Data Model
- `pokemon`: base data, imported once from the PokeAPI (id, name,
  sprite_url, types, catch_rate)
- `catches`: catch status/history (pokemon_id, caught, attempts, caught_at)

## Commands
- Backend dev server with auto-reload: `npm run dev` (inside backend/)
- Start backend normally: `npm start`
- Pokemon import (one-time): `node scripts/import-pokemon.js`

## Conventions / Rules
- Don't add new features without being asked (e.g. no auth system unless
  explicitly requested)
- Base data (pokemon table) is never re-fetched from the PokeAPI at
  runtime — only via the one-time import script
- Small, verifiable steps instead of large changes all at once
