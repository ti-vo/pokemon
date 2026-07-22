import { useEffect, useState } from "react";
import { fetchPokemonList } from "./api.js";
import PokemonCard from "./components/PokemonCard.jsx";
import WildZone from "./components/WildZone.jsx";
import { LANGUAGES, t } from "./i18n.js";

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [language, setLanguage] = useState("en");
  const [view, setView] = useState("gallery"); // "gallery" | "wildzone"

  useEffect(() => {
    fetchPokemonList()
      .then((data) => setPokemonList(data))
      .catch((err) => setLoadError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  function handleCatchButtonClick() {
    setView("wildzone");
  }

  const caughtCount = pokemonList.filter((p) => p.caught).length;

  return (
    <div className="app">
      <header className="app__header">
        <nav className="view-tabs" role="tablist" aria-label="View">
          <button
            type="button"
            role="tab"
            aria-selected={view === "gallery"}
            className={`view-tabs__button ${
              view === "gallery" ? "is-active" : ""
            }`}
            onClick={() => setView("gallery")}
          >
            {t(language, "tabGallery")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "wildzone"}
            className={`view-tabs__button ${
              view === "wildzone" ? "is-active" : ""
            }`}
            onClick={() => setView("wildzone")}
          >
            {t(language, "tabWildZone")}
          </button>
        </nav>

        <div className="app__header-main">
          <h1>{t(language, "title")}</h1>

          <div className="app__header-right">
            {view === "gallery" && (
              <p className="app__progress">
                {t(language, "progress", caughtCount, pokemonList.length)}
              </p>
            )}

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
        </div>
      </header>

      {view === "wildzone" && (
        <WildZone language={language} pokemonList={pokemonList} />
      )}

      {view === "gallery" && (
        <>
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
                  onCatchClick={handleCatchButtonClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
