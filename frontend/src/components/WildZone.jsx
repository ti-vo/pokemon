import { useEffect, useRef, useState } from "react";
import { getPokemonName } from "../i18n.js";

const MAX_CREATURES = 2;
const SPRITE_SIZE = 56;

// Linear mapping from a Pokemon's base speed stat to on-screen px/second.
// The current roster's speed stats range roughly 30-101; these bounds leave
// a little headroom on both ends.
const MIN_STAT_SPEED = 20;
const MAX_STAT_SPEED = 110;
const MIN_SPEED_PX_S = 40;
const MAX_SPEED_PX_S = 160;

// After a slot empties out (Pokemon left the zone), wait a random moment
// before it refills — 0 or 1 active Pokemon at a time is fine.
const MIN_RESPAWN_DELAY_MS = 1000;
const MAX_RESPAWN_DELAY_MS = 4000;

let nextInstanceId = 0;

// Weighted pick: a higher catch_rate (more common Pokemon) makes a Pokemon
// proportionally more likely to be the one that spawns next.
function pickWeightedPokemon(pool) {
  const weights = pool.map((p) => Math.max(p.catchRate ?? 0.5, 0.01));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function speedStatToPxPerSecond(baseSpeed) {
  const clamped = Math.min(
    MAX_STAT_SPEED,
    Math.max(MIN_STAT_SPEED, baseSpeed ?? (MIN_STAT_SPEED + MAX_STAT_SPEED) / 2)
  );
  const ratio = (clamped - MIN_STAT_SPEED) / (MAX_STAT_SPEED - MIN_STAT_SPEED);
  return MIN_SPEED_PX_S + ratio * (MAX_SPEED_PX_S - MIN_SPEED_PX_S);
}

function randomRespawnDelay() {
  return (
    MIN_RESPAWN_DELAY_MS +
    Math.random() * (MAX_RESPAWN_DELAY_MS - MIN_RESPAWN_DELAY_MS)
  );
}

function spawnCreature(pool, zoneSize) {
  const pokemon = pickWeightedPokemon(pool);
  const maxX = Math.max(0, zoneSize.width - SPRITE_SIZE);
  const maxY = Math.max(0, zoneSize.height - SPRITE_SIZE);
  const angle = Math.random() * Math.PI * 2;
  const speed = speedStatToPxPerSecond(pokemon.baseSpeed);

  return {
    instanceId: nextInstanceId++,
    pokemon,
    x: Math.random() * maxX,
    y: Math.random() * maxY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

export default function WildZone({ language, pokemonList }) {
  const zoneRef = useRef(null);
  const [zoneSize, setZoneSize] = useState({ width: 0, height: 0 });
  const [creatures, setCreatures] = useState(
    new Array(MAX_CREATURES).fill(null)
  );

  const uncaughtRef = useRef([]);
  uncaughtRef.current = pokemonList.filter((p) => !p.caught);

  // The authoritative, mutable simulation state — updated in place every
  // frame. `creatures` (React state) is just a snapshot pushed once per
  // frame for rendering, so the render path never has to be an updater
  // function with side effects in it.
  const slotsRef = useRef(new Array(MAX_CREATURES).fill(null));

  useEffect(() => {
    const element = zoneRef.current;
    if (!element) return undefined;

    const updateSize = () =>
      setZoneSize({ width: element.clientWidth, height: element.clientHeight });

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (zoneSize.width === 0 || zoneSize.height === 0) return undefined;

    let frameId;
    let lastTime = performance.now();
    const respawnTimeouts = new Array(MAX_CREATURES).fill(null);

    function scheduleRespawn(slotIndex, excludePokemonId) {
      respawnTimeouts[slotIndex] = setTimeout(() => {
        const pool = uncaughtRef.current;
        if (pool.length === 0) {
          scheduleRespawn(slotIndex, excludePokemonId);
          return;
        }
        const candidates =
          excludePokemonId != null && pool.length > 1
            ? pool.filter((p) => p.id !== excludePokemonId)
            : pool;
        slotsRef.current[slotIndex] = spawnCreature(candidates, zoneSize);
      }, randomRespawnDelay());
    }

    slotsRef.current = new Array(MAX_CREATURES).fill(null);
    for (let slot = 0; slot < MAX_CREATURES; slot++) {
      scheduleRespawn(slot, null);
    }

    const step = (time) => {
      const deltaSeconds = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      const maxX = Math.max(0, zoneSize.width - SPRITE_SIZE);
      const maxY = Math.max(0, zoneSize.height - SPRITE_SIZE);

      for (let i = 0; i < slotsRef.current.length; i++) {
        const creature = slotsRef.current[i];
        if (!creature) continue;

        const x = creature.x + creature.vx * deltaSeconds;
        const y = creature.y + creature.vy * deltaSeconds;

        if (x < 0 || x > maxX || y < 0 || y > maxY) {
          // Reached the edge: the Pokemon leaves the Wildzone instead of
          // bouncing back in.
          slotsRef.current[i] = null;
          scheduleRespawn(i, creature.pokemon.id);
        } else {
          slotsRef.current[i] = { ...creature, x, y };
        }
      }

      setCreatures([...slotsRef.current]);
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frameId);
      respawnTimeouts.forEach((id) => id && clearTimeout(id));
    };
  }, [zoneSize]);

  return (
    <div className="wild-zone" ref={zoneRef}>
      {creatures.map(
        (creature) =>
          creature && (
            <img
              key={creature.instanceId}
              className="wild-zone__sprite"
              src={creature.pokemon.spriteUrl}
              alt={getPokemonName(language, creature.pokemon)}
              style={{
                transform: `translate(${creature.x}px, ${creature.y}px)`,
              }}
            />
          )
      )}
    </div>
  );
}
