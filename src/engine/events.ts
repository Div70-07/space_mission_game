// src/engine/events.ts
import type { GameEvent, Orbit, SimEvent, Totals } from '../shared/types';
import type { RNG } from './rng';
import { randomChoice } from './rng';

export function generateEvents(
  orbit: Orbit | undefined,
  totals: Totals,
  rng: RNG,
  catalogEvents: GameEvent[] = []
): SimEvent[] {
  const events: SimEvent[] = [];
  const isMars = orbit?.id.toLowerCase().includes('mars') || orbit?.info.toLowerCase().includes('mars');

  // Day 1: Liftoff & Max-Q
  if (rng() < 0.25) {
    events.push({
      day: 1,
      text: 'Acoustic resonance peak during Max-Q transonic ascent.',
      impact: 'Structural damping held nominal; fairing separated cleanly.',
    });
  }

  // Day 45: Cruise Phase
  const cruiseRoll = rng();
  if (cruiseRoll < 0.35) {
    events.push({
      day: 45,
      text: 'Coronal Mass Ejection: Solar proton flux spiked across trajectory.',
      impact: totals.power > 150 
        ? 'Rad-hardened avionics shielded flight computer; minor 5% solar array degradation.'
        : 'Solar arrays sustained 15% degradation from solar energetic particles.',
    });
  } else if (cruiseRoll < 0.60) {
    events.push({
      day: 62,
      text: 'Deep Space Network antenna ground station maintenance outage.',
      impact: 'Telemetry downlinked safely from onboard solid-state recorder buffer.',
    });
  }

  // Day 180: Mars-specific dust storm event
  if (isMars && rng() < 0.40) {
    events.push({
      day: 180,
      text: 'Martian Regional Dust Storm: Atmospheric opacity (tau) increased.',
      impact: 'Solar generation reduced by 25%. Science operations placed on power conservation.',
    });
  }

  // Also sample from catalog events if provided by Team Member D
  if (catalogEvents.length > 0 && rng() < 0.5) {
    const chosen = randomChoice(catalogEvents, rng);
    events.push({
      day: Math.floor(rng() * 200) + 20,
      text: chosen.name + ': ' + chosen.description,
      impact: chosen.impact,
    });
  }

  return events;
}