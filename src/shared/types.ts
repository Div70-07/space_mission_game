// Units in comments: mass kg, power W, cost million USD, data MB/day, downlink MB/day.

export type Role = 'planner' | 'engineer' | 'science' | 'comms'

export interface Instrument { id: string; name: string; mass: number; power: number; cost: number; dataPerDay: number; scienceValue: number; source: string }
export interface Part { id: string; name: string; kind: 'power' | 'antenna' | 'structure'; mass: number; power: number; cost: number; downlinkPerDay: number; source: string }
export interface Rocket { id: string; name: string; cost: number; payloadByOrbit: Record<string, number>; source: string }
export interface Orbit { id: string; name: string; altitudeKm: number; info: string }
export interface Mission {
  id: string;
  name: string;
  goal: string;
  budget: number;
  lifetimeMonths: number;
  orbitIds: string[];
  minScience: number;
  level: 1 | 2 | 3;
  targetDestination?: string;
  recommendedOrbit?: string;
  description?: string;
  objective?: string;
  difficulty?: string;
  missionDuration?: string;
  scienceObjectives?: string[];
  allowedInstruments?: string[];
}
export interface GameEvent { id: string; name: string; description: string; probability: number; impact: string }
export interface RealMission { id: string; name: string; summary: string; link: string }
export interface GameData { instruments: Instrument[]; parts: Part[]; rockets: Rocket[]; orbits: Orbit[]; missions: Mission[]; events: GameEvent[]; realMissions: RealMission[] }

export interface Design {
  missionId: string; instrumentIds: string[]; powerSystemId: string; antennaId: string
  fuelKg: number; orbitId: string; rocketId: string; lifetimeMonths: number; approvedBy: Role[]
}
export interface Totals { mass: number; power: number; cost: number; dataPerDay: number; downlinkPerDay: number }
export interface Check { id: 'mass' | 'power' | 'budget' | 'data' | 'comms' | 'time' | 'launch' | 'orbit'; ok: boolean; message: string }
export interface SimEvent { day: number; text: string; impact: string }
export interface SimResult { success: boolean; score: number; events: SimEvent[]; reasons: string[]; similarRealMission?: string }
