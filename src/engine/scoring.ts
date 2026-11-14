// src/engine/scoring.ts
import type { Design, Instrument, Mission, Totals } from '../shared/types';

export function calculateScore(
  design: Design,
  mission: Mission | undefined,
  totals: Totals,
  isSuccess: boolean,
  instruments: Instrument[]
): number {
  if (!isSuccess) {
    return Math.max(10, Math.min(35, Math.round(instruments.length * 5)));
  }

  // 1. Science points (up to 45 pts)
  const totalScienceValue = instruments.reduce((sum, inst) => sum + (inst.scienceValue || 10), 0);
  const minScience = mission?.minScience || 30;
  const scienceScore = Math.min(45, Math.round((totalScienceValue / minScience) * 35));

  // 2. Budget efficiency (up to 25 pts)
  const budget = mission?.budget || 100;
  const savedBudget = Math.max(0, budget - totals.cost);
  const budgetScore = Math.min(25, Math.round((savedBudget / budget) * 25) + 10);

  // 3. Technical safety margin (up to 20 pts)
  let safetyScore = 15;
  if (totals.netPowerWatts >= 50) safetyScore += 3;
  if (totals.downlinkPerDay >= totals.dataPerDay * 1.2) safetyScore += 2;

  // 4. Teamwork bonus (all 4 roles approved = +10 pts)
  const teamBonus = Math.min(10, (design.approvedBy || []).length * 2.5);

  return Math.min(100, Math.round(scienceScore + budgetScore + safetyScore + teamBonus));
}