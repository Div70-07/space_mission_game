// Part D: Game data public door
import type { GameData, Instrument, Part, Rocket, Orbit, Mission, GameEvent, RealMission } from '@/shared/types'
import instrumentsData from './instruments.json'
import partsData from './parts.json'
import rocketsData from './rockets.json'
import orbitsData from './orbits.json'
import missionsData from './missions.json'
import eventsData from './events.json'
import realMissionsData from './realMissions.json'

export const gameData: GameData = {
  instruments: instrumentsData as Instrument[],
  parts: partsData as Part[],
  rockets: rocketsData as unknown as Rocket[],
  orbits: orbitsData as Orbit[],
  missions: missionsData as Mission[],
  events: eventsData as GameEvent[],
  realMissions: realMissionsData as RealMission[],
}
