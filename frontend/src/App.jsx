import { useEffect, useState } from "react";
import { fetchPokemonList, attemptCatch } from "./api.js";
import PokemonCard from "./components/PokemonCard.jsx";
import { LANGUAGES, t } from "./i18n.js";

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [language, setLanguage] = useState("en");

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
              stats: result.success ? result.stats : p.stats,
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
        <h1>{t(language, "title")}</h1>

        <div className="app__header-right">
          <p className="app__progress">
            {t(language, "progress", caughtCount, pokemonList.length)}
          </p>

          <div className="lang-switch" role="group" aria-label="Language">
            {Object.entries(LANGUAGES).map(([code, info]) => (
              <button
                key={code}
                type="button"
                className={`lang-switch__button ${
                  language === code ? "is-active" : ""
                }`}
                onClick={() => setLanguage(code)}
                aria-pressed={language === code}
                title={info.label}
              >
                <span aria-hidden="true">{info.flag}</span>
                <span className="lang-switch__code">{code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {isLoading && <p className="app__status">{t(language, "loading")}</p>}

      {loadError && (
        <p className="app__status app__status--error">
          {t(language, "backendError", loadError)}
        </p>
      )}

      {!isLoading && !loadError && (
        <div className="pokemon-grid">
          {pokemonList.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              language={language}
              onCatchAttempt={handleCatchAttempt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
