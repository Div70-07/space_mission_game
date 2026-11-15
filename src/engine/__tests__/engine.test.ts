// src/engine/__tests__/engine.test.ts
import { describe, it, expect } from 'vitest';
import { computeTotals } from '../totals';
import { checkDesign } from '../checkDesign';
import { requiredDeltaV, availableDeltaV } from '../deltaV';
import { checkPowerBudget } from '../power';
import { checkCommsBudget, getAttenuationFactor, computeEffectiveDownlink } from '../comms';
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

// ---------------------------------------------------------------------------
// Additional targeted tests for confirmed defects
// ---------------------------------------------------------------------------

describe('checkDesign — missing rocket / orbit messages', () => {
  const baseData: GameData = {
    instruments: [
      { id: 'cam1', name: 'Hi-Res Camera', mass: 40, power: 35, cost: 15, dataPerDay: 500, scienceValue: 25, source: 'NASA' },
    ],
    parts: [
      { id: 'solar1', name: 'Solar Array 300W', kind: 'power', mass: 50, power: 300, cost: 10, downlinkPerDay: 0, source: 'NASA' },
      { id: 'dish1', name: 'High-Gain Dish', kind: 'antenna', mass: 30, power: 20, cost: 8, downlinkPerDay: 800, source: 'NASA' },
    ],
    rockets: [
      { id: 'falcon', name: 'Falcon 9', cost: 60, payloadByOrbit: { leo: 15000 }, source: 'SpaceX' },
    ],
    orbits: [
      { id: 'leo', name: 'Low Earth Orbit', altitudeKm: 400, info: 'Earth orbit' },
    ],
    missions: [
      { id: 'm1', name: 'Earth Observer', goal: 'Observe Earth', budget: 120, lifetimeMonths: 24, orbitIds: ['leo'], minScience: 20, level: 1 },
    ],
    events: [],
    realMissions: [],
  };

  it('mass check: no rocket selected must NOT say "Over mass by 0 kg"', () => {
    const design: Design = {
      missionId: 'm1', instrumentIds: ['cam1'],
      powerSystemId: 'solar1', antennaId: 'dish1',
      fuelKg: 50, orbitId: '', rocketId: '',   // no rocket, no orbit
      lifetimeMonths: 24, approvedBy: [],
    };
    const checks = checkDesign(design, baseData);
    const massCheck = checks.find(c => c.id === 'mass')!;
    expect(massCheck.ok).toBe(false);
    expect(massCheck.message).not.toContain('Over mass by 0 kg');
    expect(massCheck.message).toMatch(/select|choose|no rocket/i);
  });

  it('mass check: real overweight must still report exact overage', () => {
    // spacecraft > payload limit: each instrument + parts = well above 100 kg limit
    const heavyData: GameData = {
      ...baseData,
      rockets: [{ id: 'tiny', name: 'Tiny Rocket', cost: 5, payloadByOrbit: { leo: 50 }, source: 'Test' }],
    };
    const design: Design = {
      missionId: 'm1', instrumentIds: ['cam1'],
      powerSystemId: 'solar1', antennaId: 'dish1',
      fuelKg: 50, orbitId: 'leo', rocketId: 'tiny',
      lifetimeMonths: 24, approvedBy: [],
    };
    const checks = checkDesign(design, heavyData);
    const massCheck = checks.find(c => c.id === 'mass')!;
    expect(massCheck.ok).toBe(false);
    // Should mention the actual overage in the launch failure message
    expect(massCheck.message).toMatch(/Spacecraft|exceeding|limit/i);
  });
});

describe('availableDeltaV — edge-case guards', () => {
  const rocket = { id: 'falcon', name: 'Falcon 9', cost: 60, payloadByOrbit: { leo: 15000 }, source: 'SpaceX' };

  it('negative fuel is clamped to 0 (no crash, no negative deltaV)', () => {
    const dv = availableDeltaV(rocket, 'leo', 500, -100);
    expect(dv).toBeGreaterThan(0);
    expect(Number.isFinite(dv)).toBe(true);
  });

  it('fuel equal to total mass (dry mass = 0) does not produce Infinity', () => {
    const dv = availableDeltaV(rocket, 'leo', 500, 500);
    expect(Number.isFinite(dv)).toBe(true);
    expect(dv).toBeGreaterThanOrEqual(0);
  });

  it('fuel greater than total mass does not produce Infinity', () => {
    const dv = availableDeltaV(rocket, 'leo', 500, 600);
    expect(Number.isFinite(dv)).toBe(true);
    expect(dv).toBeGreaterThanOrEqual(0);
  });

  it('zero fuel returns valid rocket-only deltaV', () => {
    const dv = availableDeltaV(rocket, 'leo', 500, 0);
    expect(dv).toBeGreaterThan(0);
    expect(Number.isFinite(dv)).toBe(true);
  });

  it('no rocket returns 0', () => {
    expect(availableDeltaV(undefined, 'leo', 500, 100)).toBe(0);
  });
});

describe('checkPowerBudget — no power system', () => {
  const mockTotals = { mass: 200, power: 90, cost: 50, dataPerDay: 300, downlinkPerDay: 800, lifetimeMonths: 24 };
  const leo = { id: 'leo', name: 'Low Earth Orbit', altitudeKm: 400, info: 'Earth orbit' };

  it('netPowerWatts is negative when no power system is installed', () => {
    const result = checkPowerBudget(mockTotals, leo, undefined);
    expect(result.ok).toBe(false);
    expect(result.netPowerWatts).toBeLessThan(0);  // -90 W (0 generation - 90 consumption)
    expect(result.message).toContain('No power system');
  });

  it('power system with negative power spec does not generate negative power', () => {
    const badPart = { id: 'bad', name: 'Broken Panel', kind: 'power' as const, mass: 10, power: -50, cost: 5, downlinkPerDay: 0, source: 'Test' };
    const result = checkPowerBudget(mockTotals, leo, badPart);
    expect(result.netPowerWatts).toBeLessThanOrEqual(0);
    expect(Number.isFinite(result.netPowerWatts)).toBe(true);
  });
});

describe('checkCommsBudget — negative guard & attenuation', () => {
  const leo = { id: 'leo', name: 'Low Earth Orbit', altitudeKm: 400, info: 'Earth orbit' };
  const mars = { id: 'mars', name: 'Mars Orbit', altitudeKm: 300, info: 'Mars orbit' };

  it('no antenna: message reports critical failure, not a crash', () => {
    const totals = { mass: 200, power: 50, cost: 40, dataPerDay: 100, downlinkPerDay: 0, lifetimeMonths: 12 };
    const result = checkCommsBudget(totals, leo);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('No antenna');
  });

  it('deep-space attenuation reduces effective downlink by 30%', () => {
    const totals = { mass: 200, power: 50, cost: 40, dataPerDay: 50, downlinkPerDay: 1000, lifetimeMonths: 24 };
    const result = checkCommsBudget(totals, mars);
    // effective = round(1000 * 0.7) = 700; margin = 700 - 50 = 650
    expect(result.marginMBPerDay).toBe(650);
    expect(result.ok).toBe(true);
  });

  it('Mars Climate Surveyor scenario: 2500 MB/d raw antenna with 800 MB/d data generation passes on Mars', () => {
    const marsLowOrbit = {
      id: 'mars-low',
      name: 'Low Mars Science Orbit (Mars)',
      altitudeKm: 300,
      info: 'Sun-synchronous 300 km science orbit around Mars.',
    };

    expect(getAttenuationFactor(marsLowOrbit)).toBe(0.7);
    expect(computeEffectiveDownlink(2500, marsLowOrbit)).toBe(1750);

    const totals = {
      mass: 450,
      power: 280,
      cost: 185,
      dataPerDay: 800,
      downlinkPerDay: 2500,
      lifetimeMonths: 36,
    };

    const result = checkCommsBudget(totals, marsLowOrbit);
    expect(result.ok).toBe(true);
    expect(result.rawDownlink).toBe(2500);
    expect(result.effectiveDownlink).toBe(1750);
    expect(result.attenuation).toBe(0.7);
    expect(result.marginMBPerDay).toBe(950); // 1750 - 800
    expect(result.message).toContain('nominal');
  });

  it('Mars Climate Surveyor scenario: fails if data generation exceeds effective downlink (e.g. 1800 MB/d)', () => {
    const marsLowOrbit = {
      id: 'mars-low',
      name: 'Low Mars Science Orbit (Mars)',
      altitudeKm: 300,
      info: 'Sun-synchronous 300 km science orbit around Mars.',
    };

    const totals = {
      mass: 450,
      power: 280,
      cost: 185,
      dataPerDay: 1800, // Exceeds 1750 effective downlink
      downlinkPerDay: 2500,
      lifetimeMonths: 36,
    };

    const result = checkCommsBudget(totals, marsLowOrbit);
    expect(result.ok).toBe(false);
    expect(result.effectiveDownlink).toBe(1750);
    expect(result.marginMBPerDay).toBe(-50); // 1750 - 1800
    expect(result.message).toContain('Downlink bottleneck');
  });

  it('negative totals do not crash and produce non-negative margin calc', () => {
    const totals = { mass: 0, power: 0, cost: 0, dataPerDay: -999, downlinkPerDay: -500, lifetimeMonths: 1 };
    const result = checkCommsBudget(totals, leo);
    expect(Number.isFinite(result.marginMBPerDay)).toBe(true);
    expect(result.ok).toBe(false);
  });
});

describe('runMission — deterministic with same seed', () => {
  const data: GameData = {
    instruments: [
      { id: 'cam1', name: 'Hi-Res Camera', mass: 40, power: 35, cost: 15, dataPerDay: 500, scienceValue: 25, source: 'NASA' },
    ],
    parts: [
      { id: 'solar1', name: 'Solar Array 300W', kind: 'power', mass: 50, power: 300, cost: 10, downlinkPerDay: 0, source: 'NASA' },
      { id: 'dish1', name: 'High-Gain Dish', kind: 'antenna', mass: 30, power: 20, cost: 8, downlinkPerDay: 800, source: 'NASA' },
    ],
    rockets: [{ id: 'falcon', name: 'Falcon 9', cost: 60, payloadByOrbit: { leo: 15000 }, source: 'SpaceX' }],
    orbits: [{ id: 'leo', name: 'Low Earth Orbit', altitudeKm: 400, info: 'Earth orbit' }],
    missions: [{ id: 'm1', name: 'Earth Observer', goal: 'Observe Earth', budget: 120, lifetimeMonths: 24, orbitIds: ['leo'], minScience: 20, level: 1 }],
    events: [],
    realMissions: [],
  };
  const design: Design = {
    missionId: 'm1', instrumentIds: ['cam1'],
    powerSystemId: 'solar1', antennaId: 'dish1',
    fuelKg: 100, orbitId: 'leo', rocketId: 'falcon',
    lifetimeMonths: 24, approvedBy: [],
  };

  it('two runs with the same seed return identical scores and events', () => {
    const r1 = runMission(design, data, 'SEED-42');
    const r2 = runMission(design, data, 'SEED-42');
    expect(r1.score).toBe(r2.score);
    expect(r1.events.length).toBe(r2.events.length);
    expect(r1.success).toBe(r2.success);
  });
});