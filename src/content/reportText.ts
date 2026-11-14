// src/content/reportText.ts
// Owner: D. Narrative outcome descriptions, diagnostic snippets, and failure explanations.

export interface ReportSnippet {
  title: string
  summary: string
  educationalDetail: string
  remedyRecommendation: string
}

export const REPORT_SNIPPETS = {
  // Existing keys preserved for backward compatibility
  powerFailure:
    'Power Deficit: Solar array generation was insufficient to power avionics and instruments during orbital operations.',
  commsLoss:
    'Telemetry Bottleneck: Onboard solid-state data recorder overflowed because instrument data rate exceeded antenna downlink bandwidth.',
  success:
    'Mission Nominal: All primary scientific objectives satisfied within allocated budget and flight margins.',

  // Comprehensive educational diagnostics
  missionSuccess: {
    title: 'Mission Success // All Systems Nominal',
    summary: 'The spacecraft successfully executed orbital insertion and satisfied all primary science criteria.',
    educationalDetail:
      'By carefully balancing electrical power draw, launch vehicle lift capacity, and telemetry bandwidth, your engineering team achieved a sustainable mission profile comparable to flagship NASA exploratory flights.',
    remedyRecommendation: 'Proceed to higher difficulty destinations like Mars or attempt an extended mission lifetime!',
  },

  missionFailure: {
    title: 'Mission Failure // Engineering Anomaly Detected',
    summary: 'The flight vehicle failed to achieve operational requirements due to critical subsystem constraints.',
    educationalDetail:
      'In aerospace engineering, failure of any single critical subsystem (power, mass, communications, or propulsion) jeopardizes the entire mission architecture.',
    remedyRecommendation: 'Review telemetry debrief diagnostics below to identify which subsystem triggered the abort.',
  },

  insufficientPower: {
    title: 'Electrical Power Deficit',
    summary: 'Spacecraft power consumption exceeded gross generator output, draining internal battery reserves.',
    educationalDetail:
      'Spacecraft electrical loads include continuous base bus avionics (30W), active science instruments, and RF radio transmitters. At Mars (1.524 AU), solar intensity drops to 43% of Earth levels (1/r² law), causing conventional solar panels to brown out.',
    remedyRecommendation:
      'Mount an UltraFlex High-Efficiency Solar Array or a Nuclear Radioisotope Thermoelectric Generator (RTG) for deep space missions.',
  },

  excessiveMass: {
    title: 'Excessive Wet Spacecraft Mass (Launch Vehicle Overload)',
    summary: 'Total wet spacecraft mass exceeded the payload lift limit of the selected launch vehicle.',
    educationalDetail:
      'Rockets are constrained by the Tsiolkovsky rocket equation: lifting each kilogram of payload requires exponential propellant mass. When payload mass exceeds lift ratings, the rocket cannot attain orbital insertion velocity (7.8 km/s for LEO).',
    remedyRecommendation:
      'Upgrade to a heavier commercial launcher (such as Falcon 9 or Atlas V) or downsize heavy payload instruments.',
  },

  budgetExceeded: {
    title: 'Fiscal Authorization Exceeded (Cost Overrun)',
    summary: 'Total combined expenditure on spacecraft subsystems and launch services exceeded the authorized NASA mission budget.',
    educationalDetail:
      'Real-world NASA missions are governed by strict cost caps (e.g. Discovery Class ~$500M, New Frontiers ~$1B). Exceeding budget allocations in the design phase leads to project cancellation or descoping.',
    remedyRecommendation:
      'Select cost-effective commercial launch options (such as Electron or Falcon 9) or swap expensive optical instruments for compact sensors.',
  },

  insufficientCommunication: {
    title: 'Telemetry Downlink Bottleneck & Buffer Overflow',
    summary: 'Mounted science instruments generated data faster than the communication subsystem could transmit back to Earth.',
    educationalDetail:
      'Without adequate antenna gain or transmitter amplification, deep space radio signals attenuate over millions of kilometers. Science data fills the solid-state recorder buffer, causing subsequent observations to be overwritten and lost.',
    remedyRecommendation:
      'Equip a High-Gain Parabolic Reflector Dish (X-Band) or Deep Space Optical Ka-Band Laser Terminal to expand downlink throughput.',
  },

  insufficientDeltaV: {
    title: 'Velocity Increment (Δv) Deficit',
    summary: 'Available spacecraft velocity change was insufficient to achieve the required orbital insertion trajectory.',
    educationalDetail:
      'Reaching higher orbits (such as Geostationary or Lunar insertion) requires significant velocity changes (Delta-v). If onboard propellant or rocket staging cannot provide the required Δv, the spacecraft remains stranded in a lower unusable transfer orbit.',
    remedyRecommendation:
      'Increase onboard propellant fuel mass (kg) or select a higher-energy upper stage launch vehicle.',
  },

  instrumentFailure: {
    title: 'Insufficient Scientific Harvest',
    summary: 'No science instruments mounted or cumulative science value did not satisfy minimum mission requirements.',
    educationalDetail:
      'A spacecraft bus without an operational scientific payload serves no research purpose. NASA missions must deliver measurable scientific return to justify federal funding and flight operations.',
    remedyRecommendation:
      'Select complementary instruments (cameras, spectrometers, or magnetometers) to fulfill your primary mission objectives.',
  },
}

/**
 * Generates an educational summary for a specific failure check ID.
 */
export function getExplanationForCheck(checkId: string): string {
  switch (checkId) {
    case 'power':
      return REPORT_SNIPPETS.insufficientPower.educationalDetail
    case 'mass':
    case 'launch':
      return REPORT_SNIPPETS.excessiveMass.educationalDetail
    case 'budget':
      return REPORT_SNIPPETS.budgetExceeded.educationalDetail
    case 'comms':
      return REPORT_SNIPPETS.insufficientCommunication.educationalDetail
    case 'orbit':
      return REPORT_SNIPPETS.insufficientDeltaV.educationalDetail
    case 'data':
      return REPORT_SNIPPETS.instrumentFailure.educationalDetail
    default:
      return 'Maintain nominal subsystem telemetry margins to guarantee flight mission safety.'
  }
}

export default REPORT_SNIPPETS
