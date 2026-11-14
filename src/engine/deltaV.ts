// src/engine/deltaV.ts
import type { Orbit, Rocket } from '../shared/types';

/**
 * GMAT-derived reference Delta-V values (km/s) from Earth surface to target orbit.
 */
export const GMAT_DELTA_V_BENCHMARKS: Record<string, number> = {
  leo: 9.4,   // Low Earth Orbit (altitude ~400km)
  sso: 9.8,   // Sun-Synchronous Orbit (polar)
  geo: 11.8,  // Geostationary Orbit
  gto: 11.2,  // Geostationary Transfer
  moon: 13.8, // Low Lunar Orbit
  mars: 15.2, // Mars Orbit Insertion
};

/**
 * Returns required Delta-V (km/s) for the specified orbit.
 */
export function requiredDeltaV(orbit: Orbit | undefined): number {
  if (!orbit) return 9.4;

  const id = orbit.id.toLowerCase();
  for (const key of Object.keys(GMAT_DELTA_V_BENCHMARKS)) {
    if (id.includes(key)) return GMAT_DELTA_V_BENCHMARKS[key];
  }

  // Fallback estimation using altitude
  if (orbit.altitudeKm > 50000) return 14.5;
  if (orbit.altitudeKm > 20000) return 11.5;
  return 9.4;
}

/**
 * Calculates Available Delta-V (km/s) using rocket payload capacity & spacecraft fuel.
 */
export function availableDeltaV(
  rocket: Rocket | undefined,
  orbitId: string,
  totalMassKg: number,
  fuelKg: number = 0
): number {
  if (!rocket) return 0;

  const maxCapacity = rocket.payloadByOrbit[orbitId] ?? 3000;
  if (totalMassKg <= 0 || totalMassKg > maxCapacity * 1.5) return 0;

  // Base launch vehicle delta-V delivery
  const massRatio = Math.max(0.1, 1 - totalMassKg / (maxCapacity * 1.3));
  const rocketDeltaV = 14.0 * Math.sqrt(massRatio);

  // Spacecraft onboard propulsion delta-V (Tsiolkovsky: Isp = 310s hydrazine)
  let spacecraftDeltaV = 0;
  if (fuelKg > 0 && totalMassKg > fuelKg) {
    const dryMass = totalMassKg - fuelKg;
    spacecraftDeltaV = (310 * 9.81 * Math.log(totalMassKg / dryMass)) / 1000; // in km/s
  }

  return Number((rocketDeltaV + spacecraftDeltaV).toFixed(2));
}