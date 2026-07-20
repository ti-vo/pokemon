// i18n.js
// Small, dependency-free translation setup. No i18n library needed for
// just two languages and a handful of strings.

export const LANGUAGES = {
  en: { label: "English", flag: "🇬🇧" },
  de: { label: "Deutsch", flag: "🇩🇪" },
};

const STRINGS = {
  en: {
    title: "Pokemon Catch Tracker",
    progress: (caught, total) => `${caught} / ${total} caught`,
    loading: "Loading Pokemon...",
    backendError: (message) =>
      `Could not reach the backend (${message}). Is it running on port 3001?`,
    catchButton: "Catch",
    caughtStatus: "Caught",
    escaped: "It escaped!",
    caught: "Caught!",
    attempts: (count) => `Attempts: ${count}`,
  },
  de: {
    title: "Pokémon Fang-Tracker",
    progress: (caught, total) => `${caught} / ${total} gefangen`,
    loading: "Pokémon werden geladen...",
    backendError: (message) =>
      `Backend nicht erreichbar (${message}). Läuft es auf Port 3001?`,
    catchButton: "Fangen",
    caughtStatus: "Gefangen",
    escaped: "Es ist entkommen!",
    caught: "Gefangen!",
    attempts: (count) => `Versuche: ${count}`,
  },
};

// Type names as shown on the PokeAPI (English) mapped to German. Types are
// a small, fixed set (~18), so a hardcoded map is simpler and more reliable
// here than an extra API call per type.
const TYPE_NAMES_DE = {
  normal: "Normal",
  fire: "Feuer",
  water: "Wasser",
  electric: "Elektro",
  grass: "Pflanze",
  ice: "Eis",
  fighting: "Kampf",
  poison: "Gift",
  ground: "Boden",
  flying: "Flug",
  psychic: "Psycho",
  bug: "Käfer",
  rock: "Gestein",
  ghost: "Geist",
  dragon: "Drache",
  dark: "Unlicht",
  steel: "Stahl",
  fairy: "Fee",
};

export function t(language, key, ...args) {
  const entry = STRINGS[language]?.[key] ?? STRINGS.en[key];
  return typeof entry === "function" ? entry(...args) : entry;
}

export function translateType(language, type) {
  if (language === "de") {
    return TYPE_NAMES_DE[type] || type;
  }
  return type;
}

export function getPokemonName(language, pokemon) {
  if (language === "de" && pokemon.nameDe) {
    return pokemon.nameDe;
  }
  return pokemon.name;
}
