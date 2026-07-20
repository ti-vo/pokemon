import { useState } from "react";

// Classic Pokemon type colors, used for the small type badges.
// Not every type is needed for the first 20 Pokemon, but keeping the full
// map means new imports (more Pokemon later) won't need any code changes.
const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export default function PokemonCard({ pokemon, onCatchAttempt }) {
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState(null); // "success" | "fail" | null

  async function handleCatchClick() {
    setIsRolling(true);
    setLastResult(null);
    try {
      const result = await onCatchAttempt(pokemon.id);
      setLastResult(result.success ? "success" : "fail");
    } finally {
      setIsRolling(false);
      // Clear the "escaped" message after a moment so the card can be
      // tried again without a stale message lingering.
      setTimeout(() => setLastResult(null), 1500);
    }
  }

  return (
    <div className={`pokemon-card ${pokemon.caught ? "is-caught" : ""}`}>
      <div className="pokemon-card__sprite-wrap">
        <img
          className="pokemon-card__sprite"
          src={pokemon.spriteUrl}
          alt={pokemon.name}
          loading="lazy"
        />
      </div>

      <p className="pokemon-card__id">#{String(pokemon.id).padStart(3, "0")}</p>
      <h3 className="pokemon-card__name">{pokemon.name}</h3>

      <div className="pokemon-card__types">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className="pokemon-card__type-badge"
            style={{ backgroundColor: TYPE_COLORS[type] || "#888" }}
          >
            {type}
          </span>
        ))}
      </div>

      {pokemon.caught ? (
        <p className="pokemon-card__status">Caught</p>
      ) : (
        <button
          className="pokemon-card__catch-button"
          onClick={handleCatchClick}
          disabled={isRolling}
        >
          {isRolling ? "..." : "Catch"}
        </button>
      )}

      {lastResult === "fail" && (
        <p className="pokemon-card__feedback pokemon-card__feedback--fail">
          It escaped!
        </p>
      )}
      {lastResult === "success" && (
        <p className="pokemon-card__feedback pokemon-card__feedback--success">
          Caught!
        </p>
      )}

      <p className="pokemon-card__attempts">
        Attempts: {pokemon.attempts}
      </p>
    </div>
  );
}
