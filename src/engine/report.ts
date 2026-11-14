// src/engine/report.ts
import type { Check, GameData, Mission, Orbit } from '../shared/types';

export function generateReport(
  checks: Check[],
  orbit: Orbit | undefined,
  mission: Mission | undefined,
  data: GameData
): { reasons: string[]; similarRealMission: string } {
  const reasons: string[] = [];
  const failedChecks = checks.filter(c => !c.ok);

  if (failedChecks.length === 0) {
    reasons.push('All engineering systems nominal: Rocket delta-v, solar generation, and telemetry downlink satisfied mission objectives.');
  } else {
    for (const failure of failedChecks) {
      reasons.push(failure.message);
    }
  }

  // Match similar real NASA mission
  const target = orbit?.id.toLowerCase() || 'earth';
  let match = (data.realMissions || []).find(rm => rm.summary.toLowerCase().includes(target));

  if (!match && data.realMissions && data.realMissions.length > 0) {
    match = data.realMissions[0];
  }

  const similarRealMission = match
    ? `${match.name}: ${match.summary}`
    : 'MAVEN (Mars Atmosphere and Volatile EvolutioN) — studied planetary atmospheric loss.';

  return {
    reasons,
    similarRealMission,
  };
}