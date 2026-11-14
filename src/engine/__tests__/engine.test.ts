// src/engine/__tests__/engine.test.ts
import { describe, it, expect } from 'vitest';
import { computeTotals } from '../totals';
import { checkDesign } from '../checkDesign';
import { requiredDeltaV } from '../deltaV'; // Removed unused availableDeltaV
import { runMission } from '../runMission';
import { createRNG } from '../rng';
import type { Design, GameData } from '../../shared/types';

describe('NASA Mission Engine', () => {
  const mockData: GameData = {
    instruments: [
      { id: 'cam1', name: 'Hi-Res Camera', mass: 40, power: 35, cost: 15, dataPerDay: 500, scienceValue: 25, source: 'NASA' },
    ],
    parts: [
      { id: 'solar1', name: 'Solar Array 300W', kind: 'power', mass: 50, power: 300, cost: 10, downlinkPerDay: 0, source: 'NASA' },
      { id: 'dish1', name: 'High-Gain Dish', kind: 'antenna', mass: 30, power: 20, cost: 8, downlinkPerDay: 800, source: 'NASA' },
    ],
    rockets: [
      { id: 'falcon', name: 'Falcon 9', cost: 60, payloadByOrbit: { leo: 15000, mars: 3000 }, source: 'SpaceX' },
    ],
    orbits: [
      { id: 'leo', name: 'Low Earth Orbit', altitudeKm: 400, info: 'Earth orbit' },
      { id: 'mars', name: 'Mars Orbit', altitudeKm: 500, info: 'Mars orbit' },
    ],
    missions: [
      { id: 'm1', name: 'Earth Observer', goal: 'Observe Earth', budget: 120, lifetimeMonths: 24, orbitIds: ['leo'], minScience: 20, level: 1 },
    ],
    events: [],
    realMissions: [
      { id: 'pace', name: 'PACE', summary: 'Earth ocean observer', link: 'https://nasa.gov' },
    ],
  };

  const mockDesign: Design = {
    missionId: 'm1',
    instrumentIds: ['cam1'],
    powerSystemId: 'solar1',
    antennaId: 'dish1',
    fuelKg: 100,
    orbitId: 'leo',
    rocketId: 'falcon',
    lifetimeMonths: 24,
    approvedBy: ['planner', 'engineer', 'science', 'comms'],
  };

  it('computes totals accurately', () => {
    const totals = computeTotals(mockDesign, mockData);
    expect(totals.mass).toBe(320);
    expect(totals.power).toBeDefined();
    expect(totals.cost).toBe(93);
  });

  it('validates a balanced design with all checks passing', () => {
    const checks = checkDesign(mockDesign, mockData);
    expect(checks.length).toBe(8);
    const allPassed = checks.every(c => c.ok);
    expect(allPassed).toBe(true);
  });

  it('GMAT Delta-V: Mars orbit requires more delta-v than LEO', () => {
    const leoDv = requiredDeltaV(mockData.orbits[0]);
    const marsDv = requiredDeltaV(mockData.orbits[1]);
    expect(marsDv).toBeGreaterThan(leoDv);
  });

  it('deterministic RNG yields identical sequences with same seed', () => {
    const rngA = createRNG('NASA-2026');
    const rngB = createRNG('NASA-2026');
    expect(rngA()).toEqual(rngB());
    expect(rngA()).toEqual(rngB());
  });

  it('runs mission simulation and returns complete SimResult', () => {
    const result = runMission(mockDesign, mockData, 'NASA-2026');
    expect(result.success).toBe(true);
    expect(result.score).toBeGreaterThan(50);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.similarRealMission).toBeDefined();
  });
});