// db.js
// Sets up the SQLite connection and creates the schema if it doesn't exist yet.
// See CLAUDE.md for the data model rationale (two tables: static base data
// vs. mutable catch progress).

const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "pokemon.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS pokemon (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    sprite_url TEXT,
    types TEXT,
    catch_rate REAL NOT NULL DEFAULT 0.5
  );

  CREATE TABLE IF NOT EXISTS catches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pokemon_id INTEGER NOT NULL,
    caught INTEGER NOT NULL DEFAULT 0,
    attempts INTEGER NOT NULL DEFAULT 0,
    caught_at DATETIME,
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
  );
`);

module.exports = db;
