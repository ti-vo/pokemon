import { t, getPokemonName } from "../i18n.js";

export default function CatchArena({ language, pokemon }) {
  const name = pokemon ? getPokemonName(language, pokemon) : null;

  return (
    <div className="catch-arena">
      <p className="catch-arena__placeholder">
        {t(language, "arenaPlaceholder", name)}
      </p>
    </div>
  );
}
