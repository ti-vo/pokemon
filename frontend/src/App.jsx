import { useEffect, useState } from "react";
import { fetchPokemonList, attemptCatch } from "./api.js";
import PokemonCard from "./components/PokemonCard.jsx";

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchPokemonList()
      .then((data) => setPokemonList(data))
      .catch((err) => setLoadError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCatchAttempt(pokemonId) {
    const result = await attemptCatch(pokemonId);

    // Update local state immediately instead of re-fetching the whole list,
    // so the UI feels instant.
    setPokemonList((current) =>
      current.map((p) =>
        p.id === pokemonId
          ? {
              ...p,
              caught: result.success ? true : p.caught,
              attempts: p.attempts + 1,
            }
          : p
      )
    );

    return result;
  }

  const caughtCount = pokemonList.filter((p) => p.caught).length;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Pokemon Catch Tracker</h1>
        <p className="app__progress">
          {caughtCount} / {pokemonList.length} caught
        </p>
      </header>

      {isLoading && <p className="app__status">Loading Pokemon...</p>}

      {loadError && (
        <p className="app__status app__status--error">
          Could not reach the backend ({loadError}). Is it running on port
          3001?
        </p>
      )}

      {!isLoading && !loadError && (
        <div className="pokemon-grid">
          {pokemonList.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              onCatchAttempt={handleCatchAttempt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
