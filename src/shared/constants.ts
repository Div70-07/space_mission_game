// Owner: Leader. Shared constants and default game values.
export const ROLES = ['planner', 'engineer', 'science', 'comms'] as const
export const RESOURCE_UNITS = {
  mass: 'kg',
  power: 'W',
  cost: 'M USD',
  dataPerDay: 'MB/day',
  downlinkPerDay: 'MB/day',
} as const
