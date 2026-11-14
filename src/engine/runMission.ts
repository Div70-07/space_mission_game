// src/engine/runMission.ts
import type { Design, GameData, SimResult } from '../shared/types';
import { createRNG } from './rng';
import { computeTotals } from './totals';
import { checkDesign } from './checkDesign';
import { generateEvents } from './events';
import { calculateScore } from './scoring';
import { generateReport } from './report';

export function runMission(
  design: Design,
  data: GameData,
  seed: string | number = 42
): SimResult {
  const rng = createRNG(seed);
  const totals = computeTotals(design, data);
  const checks = checkDesign(design, data);

  const mission = data.missions.find(m => m.id === design.missionId);
  const orbit = data.orbits.find(o => o.id === design.orbitId);
  const selectedInstruments = data.instruments.filter(i =>
    (design.instrumentIds || []).includes(i.id)
  );

  // Success requires all 8 checks to pass
  const success = checks.every(c => c.ok);

  // Events & scoring
  const events = generateEvents(orbit, totals, rng, data.events);
  const score = calculateScore(design, mission, totals, success, selectedInstruments);
  const { reasons, similarRealMission } = generateReport(checks, orbit, mission, data);

  return {
    success,
    score,
    events,
    reasons,
    similarRealMission,
  };
}