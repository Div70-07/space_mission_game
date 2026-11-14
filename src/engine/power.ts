// src/engine/power.ts
import type { Orbit, Part, Totals } from '../shared/types';

export interface PowerBudgetResult {
  ok: boolean;
  netPowerWatts: number;
  solarFactor: number;
  message: string;
}

export function checkPowerBudget(
  totals: Totals,
  orbit: Orbit | undefined,
  powerSystem: Part | undefined
): PowerBudgetResult {
  const isMars = orbit?.id.toLowerCase().includes('mars') || orbit?.info.toLowerCase().includes('mars');
  const isRTG = powerSystem?.name.toLowerCase().includes('rtg') || powerSystem?.name.toLowerCase().includes('nuclear');

  // Inverse square law: Mars is 1.524 AU from Sun -> 1 / (1.524^2) = ~0.43
  const solarFactor = isMars ? (isRTG ? 1.0 : 0.43) : 1.0;

  const grossGeneration = powerSystem
    ? Math.round(Math.max(0, powerSystem.power) * solarFactor)  // guard: clamp negative power spec to 0
    : 0;
  const netPowerWatts = grossGeneration - totals.power;
  const ok = netPowerWatts >= 0 && grossGeneration > 0;

  let message = 'Power budget nominal.';
  if (!powerSystem) {
    message = 'Critical: No power system installed.';
  } else if (isMars && !isRTG && netPowerWatts < 0) {
    message = `Mars Solar Deficit (1/r² law): Sunlight is only 43% of Earth intensity. Panels produce ${grossGeneration}W for a ${totals.power}W load.`;
  } else if (netPowerWatts < 0) {
    message = `Power deficit: Spacecraft consumes ${totals.power}W but generates only ${grossGeneration}W.`;
  }

  return {
    ok,
    netPowerWatts,
    solarFactor,
    message,
  };
}