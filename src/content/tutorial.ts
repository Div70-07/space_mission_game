// src/content/tutorial.ts
// Owner: D. Step-by-step game tutorial and aerospace engineering guidance for students.

export interface TutorialStep {
  step: number
  title: string
  text: string
  details?: string
  roleFocus?: string
  proTip?: string
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: 'Mission Selection',
    text: 'Choose your scientific destination and operational constraints.',
    details:
      'Begin by picking an official flight mission: Earth Climate Observer (Level 1), Lunar Polar Prospector (Level 2), or Mars Climate Surveyor (Level 3). Review the primary research goals, project budget, and required mission lifetime before assembling hardware.',
    roleFocus: 'Planner Specialist',
    proTip: 'Higher level missions like Mars have larger budgets, but face severe solar drop-offs and harsh deep space communication delays!',
  },
  {
    step: 2,
    title: 'Spacecraft Assembly & Instruments',
    text: 'Mount scientific sensors to achieve your mission science quota.',
    details:
      'Browse the instrument registry to equip cameras, spectrometers, radars, and magnetometers. Each instrument adds mass, draws power, and generates daily science data. Your cumulative science score must meet or exceed the mission requirement.',
    roleFocus: 'Science Lead',
    proTip: 'High-resolution imagers return massive science value, but require heavy power and high-bandwidth telemetry antennas!',
  },
  {
    step: 3,
    title: 'Subsystem Engineering (Power & Comms)',
    text: 'Balance electrical generation and telemetry bandwidth against payload demands.',
    details:
      'Choose an electrical power system (Solar Arrays or Nuclear RTGs) capable of powering your avionics, instruments, and radio transmitter. Then select an antenna (Omni, Horn, Parabolic Dish, or Optical Laser) to prevent data buffer overflow.',
    roleFocus: 'Lead Engineer & Comms Officer',
    proTip: 'At Mars, solar radiation drops by 57% due to the inverse square law (1/r²). Consider using an RTG or oversized UltraFlex solar wings!',
  },
  {
    step: 4,
    title: 'Orbit & Rocket Vehicle Staging',
    text: 'Match payload mass and orbital energy (Delta-v) with a launch vehicle.',
    details:
      'Select a compatible target deployment orbit (such as LEO, SSO, Low Lunar Orbit, or Mars Science Orbit). Then choose a commercial launch vehicle (like Falcon 9, Atlas V, Vulcan, or SLS) whose lift capacity exceeds your wet spacecraft mass.',
    roleFocus: 'Planner & Engineer',
    proTip: 'Always verify your Delta-v margin! If available Δv is lower than required Δv, increase propellant mass or choose a higher-capacity launcher.',
  },
  {
    step: 5,
    title: 'Multi-Role Flight Readiness Gate',
    text: 'Collaborate with your team to review subsystems and approve launch.',
    details:
      'In team mode, all four flight directors (Planner, Engineer, Science Lead, and Comms Officer) must review engineering telemetry and sign off on the flight plan before the launch sequencer is authorized to initiate countdown.',
    roleFocus: 'All Subsystem Directors',
    proTip: 'If any subsystem fails (e.g. over-budget or power deficit), work together to downsize non-essential instruments or reconfigure orbits.',
  },
  {
    step: 6,
    title: 'Launch Simulation & Mission Debrief',
    text: 'Watch your spacecraft fly and analyze real-world telemetry outcomes.',
    details:
      'Experience the 2D mission flight visualizer through liftoff, transonic Max-Q, interplanetary cruise, and orbital capture. After insertion, inspect your flight telemetry score, random space weather events, and compare your design with historic NASA missions.',
    roleFocus: 'Flight Operations Team',
    proTip: 'Read the debrief report carefully to understand why specific subsystems succeeded or encountered anomalies.',
  },
]

export const ROLE_GUIDES = [
  {
    role: 'planner',
    title: 'Mission Planner',
    responsibility: 'Selects target destination, orbital trajectory, and mission duration within budget constraints.',
    keyMetrics: ['Budget ($M)', 'Mission Lifetime (Months)', 'Orbital Apogee / Perigee'],
  },
  {
    role: 'engineer',
    title: 'Spacecraft Systems Engineer',
    responsibility: 'Manages spacecraft dry mass, solar/nuclear power generation, and launch vehicle lift margins.',
    keyMetrics: ['Mass Margin (kg)', 'Net Power (Watts)', 'Propellant Fuel (kg)'],
  },
  {
    role: 'science',
    title: 'Science Payload Director',
    responsibility: 'Curates instrument suites to maximize scientific discovery yield while respecting power constraints.',
    keyMetrics: ['Total Science Yield (pts)', 'Daily Data Production (MB/day)'],
  },
  {
    role: 'comms',
    title: 'Telecommunications Officer',
    responsibility: 'Configures high-gain transmitters to guarantee uninterrupted downlink to the NASA Deep Space Network.',
    keyMetrics: ['Downlink Bandwidth (MB/day)', 'Buffer Overflow Margin'],
  },
]

export default TUTORIAL_STEPS
