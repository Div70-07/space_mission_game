// src/engine/checkDesign.ts
import type { Check, Design, GameData } from '../shared/types';
import { computeTotals } from './totals';
import { checkLaunch, checkOrbit } from './launch';
import { checkPowerBudget } from './power';
import { checkCommsBudget } from './comms';
import { availableDeltaV } from './deltaV';

export function checkDesign(design: Design, data: GameData): Check[] {
  const totals = computeTotals(design, data);
  const mission = data.missions.find(m => m.id === design.missionId);
  const rocket = data.rockets.find(r => r.id === design.rocketId);
  const orbit = data.orbits.find(o => o.id === design.orbitId);
  const powerSystem = data.parts.find(p => p.id === design.powerSystemId);

  const launchRes = checkLaunch(rocket, orbit, totals);
  const availDv = availableDeltaV(rocket, design.orbitId, totals.mass, design.fuelKg);
  const orbitRes = checkOrbit(orbit, availDv);
  const powerRes = checkPowerBudget(totals, orbit, powerSystem);
  const commsRes = checkCommsBudget(totals, orbit);

  const budget = mission?.budget ?? 100;
  const budgetOk = totals.cost <= budget;

  const minLifetime = mission?.lifetimeMonths ?? 12;
  const timeOk = design.lifetimeMonths >= minLifetime;

  const hasInstruments = (design.instrumentIds || []).length > 0;

  return [
    {
      id: 'mass',
      ok: launchRes.ok,
      // Use launchRes.message directly so "no rocket selected" is never reported
      // as "Over mass by 0 kg" – the message already distinguishes the two cases.
      message: launchRes.ok
        ? `Mass ok (${totals.mass} kg <= ${launchRes.maxPayload} kg)`
        : launchRes.message,
    },
    {
      id: 'power',
      ok: powerRes.ok,
      message: powerRes.message,
    },
    {
      id: 'budget',
      ok: budgetOk,
      message: budgetOk
        ? `Budget ok: $${totals.cost}M / $${budget}M`
        : `Over budget by $${(totals.cost - budget).toFixed(1)}M.`,
    },
    {
      id: 'data',
      ok: hasInstruments,
      message: hasInstruments
        ? `Science active: ${totals.dataPerDay} MB/day generated.`
        : 'No science instruments selected!',
    },
    {
      id: 'comms',
      ok: commsRes.ok,
      message: commsRes.message,
    },
    {
      id: 'time',
      ok: timeOk,
      message: timeOk
        ? `Mission duration ${design.lifetimeMonths} months satisfies goal.`
        : `Duration (${design.lifetimeMonths}m) is shorter than required (${minLifetime}m).`,
    },
    {
      id: 'launch',
      ok: !!rocket && launchRes.ok,
      message: launchRes.message,
    },
    {
      id: 'orbit',
      ok: !!orbit && orbitRes.ok,
      message: orbitRes.message,
    },
  ];
}