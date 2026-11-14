// src/engine/totals.ts
import type { Design, GameData, Totals } from '../shared/types';

export function computeTotals(design: Design | undefined, data: GameData | undefined): Totals {
  const fallback: Totals = {
    mass: 0,
    power: 0,
    cost: 0,
    dataPerDay: 0,
    downlinkPerDay: 0,
  };

  if (!design || !data) return fallback;

  // Selected components
  const selectedInstruments = (data.instruments || []).filter(inst =>
    (design.instrumentIds || []).includes(inst.id)
  );
  const powerSystem = (data.parts || []).find(p => p.id === design.powerSystemId);
  const antenna = (data.parts || []).find(p => p.id === design.antennaId);
  const rocket = (data.rockets || []).find(r => r.id === design.rocketId);

  // 1. Mass calculation (kg)
  const busStructureMass = 100; // Bus frame and avionics
  const instrumentsMass = selectedInstruments.reduce((sum, i) => sum + i.mass, 0);
  const powerMass = powerSystem?.mass ?? 0;
  const antennaMass = antenna?.mass ?? 0;
  const fuelMass = design.fuelKg || 0;
  const totalMass = busStructureMass + instrumentsMass + powerMass + antennaMass + fuelMass;

  // 2. Power calculation (Watts)
  const baseAvionicsPower = 30; // Flight computer & attitude control
  const instrumentsPower = selectedInstruments.reduce((sum, i) => sum + i.power, 0);
  const totalPowerConsumption = baseAvionicsPower + instrumentsPower;

  // 3. Cost calculation (million USD)
  const instrumentsCost = selectedInstruments.reduce((sum, i) => sum + i.cost, 0);
  const powerCost = powerSystem?.cost ?? 0;
  const antennaCost = antenna?.cost ?? 0;
  const rocketCost = rocket?.cost ?? 0;
  const totalCost = instrumentsCost + powerCost + antennaCost + rocketCost;

  // 4. Data production & Downlink (MB/day)
  const dataPerDay = selectedInstruments.reduce((sum, i) => sum + i.dataPerDay, 0);
  const downlinkPerDay = antenna?.downlinkPerDay ?? 0;

  return {
    mass: Math.round(totalMass),
    power: Math.round(totalPowerConsumption),
    cost: Number(totalCost.toFixed(2)),
    dataPerDay: Math.round(dataPerDay),
    downlinkPerDay: Math.round(downlinkPerDay),
  };
}