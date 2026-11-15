// Owner: B. Interactive tutorial and flight director onboarding workstation.
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TUTORIAL_STEPS, ROLE_GUIDES } from '@/content/tutorial'
import { Tooltip } from './components/Tooltip'

interface TutorialStep {
  id: number
  badge: string
  role: string
  roleKey?: 'planner' | 'engineer' | 'science' | 'comms'
  title: string
  subtitle: string
  summary: string
  keyPoints: string[]
  proTip: string
  imageSrc: string
  imageLabel: string
  telemetryPreview?: {
    label: string
    value: string
    status: 'nominal' | 'warning' | 'info'
  }[]
}

const STEPS: TutorialStep[] = [
  {
    id: 1,
    badge: 'Lesson 1 · Selection',
    role: 'FLIGHT DIRECTOR & PLANNER',
    roleKey: 'planner',
    title: 'Select Your Flight Mission',
    subtitle: 'Establish scientific destination, research charter, and fiscal constraints',
    summary: TUTORIAL_STEPS[0]?.text || 'Choose your scientific destination and constraints.',
    imageSrc: '/images/earth_planet_view.jpg',
    imageLabel: 'Destination Selection · Planetary Trajectory Matrix',
    keyPoints: [
      'Browse official NASA flight profiles categorized by difficulty (Level 1: Earth-Moon, Level 2: Inner Planets, Level 3: Deep Space).',
      'Each mission establishes a strict capital budget ceiling ($M USD) and required operating lifetime (months).',
      'Review target destinations and primary science thresholds before configuring your satellite hardware.',
    ],
    proTip: TUTORIAL_STEPS[0]?.proTip || 'Beginner flight architects should start with Level 1 missions (like Lunar Reconnaissance) to master core mass and power tradeoffs before tackling interplanetary trajectories.',
    telemetryPreview: [
      { label: 'Classification', value: 'Level 1 Lunar Explorer', status: 'nominal' },
      { label: 'Budget Ceiling', value: '$120.0M USD', status: 'nominal' },
      { label: 'Minimum Lifetime', value: '24 Months', status: 'info' },
      { label: 'Primary Destination', value: 'Moon (384,400 km)', status: 'nominal' },
    ],
  },
  {
    id: 2,
    badge: 'Lesson 2 · Objectives',
    role: 'MISSION ARCHITECT',
    roleKey: 'planner',
    title: 'Analyze Mission Objectives & Constraints',
    subtitle: 'Evaluate orbital destination requirements, science quotas, and environmental limits',
    summary: 'Analyze operational requirements to tailor your spacecraft architecture.',
    imageSrc: '/images/mars_planet_view.jpg',
    imageLabel: 'Mission Architecture · Orbital Science Targets',
    keyPoints: [
      'Each mission specifies target trajectory orbits (e.g. Low Earth Orbit, Polar SSO, Lunar Orbit, Mars Insertion).',
      'Minimum science thresholds dictate the required scientific instrumentation capacity.',
      'Operational lifetime defines how long your components and power sources must survive deep-space radiation.',
    ],
    proTip: 'Study the mission trajectory requirements early: deep-space destinations demand higher velocity increments (Delta-V) and resilient power sources.',
    telemetryPreview: [
      { label: 'Target Orbits', value: 'LEO / Lunar Orbit', status: 'nominal' },
      { label: 'Target Science', value: 'Min. 50 Science Pts', status: 'info' },
      { label: 'Destination Range', value: '384,400 km', status: 'nominal' },
      { label: 'Thermal Profile', value: '-120°C to +130°C', status: 'nominal' },
    ],
  },
  {
    id: 3,
    badge: 'Lesson 3 · Payload Bay',
    role: 'SCIENCE PAYLOAD LEAD',
    roleKey: 'science',
    title: 'Mount Scientific Payload Bay',
    subtitle: 'Integrate cameras, spectrometers, and magnetometers to maximize research yield',
    summary: TUTORIAL_STEPS[1]?.text || 'Mount specialized scientific instruments to collect mission data.',
    imageSrc: '/images/spacecraft_satellite_orbit.jpg',
    imageLabel: 'Payload Integration · Sensor Suite Mounting',
    keyPoints: [
      'The Science role manages the payload bay in the Builder workstation.',
      'Each instrument yields science value points and generates scientific data (MB/day).',
      'Instruments consume electrical power (Watts) and add physical mass (kg) to the spacecraft bus.',
    ],
    proTip: TUTORIAL_STEPS[1]?.proTip || 'Avoid over-equipping early: mounting too many instruments can quickly exceed your electrical power reserves and overload your communications downlink.',
    telemetryPreview: [
      { label: 'Payload Mass', value: '145 kg', status: 'nominal' },
      { label: 'Data Production', value: '620 MB/day', status: 'info' },
      { label: 'Power Consumption', value: '180 W', status: 'warning' },
      { label: 'Science Score Yield', value: '88 / 100 PTS', status: 'nominal' },
    ],
  },
  {
    id: 4,
    badge: 'Lesson 4 · Bus Systems',
    role: 'SYSTEMS ENGINEER & COMMS',
    roleKey: 'engineer',
    title: 'Configure Power & Telecommunications',
    subtitle: 'Balance electrical generation and ground station telemetry downlink bandwidth',
    summary: TUTORIAL_STEPS[2]?.text || 'Ensure your satellite generates enough power and can transmit all scientific data home.',
    imageSrc: '/images/spacecraft_satellite_orbit.jpg',
    imageLabel: 'Spacecraft Bus · Electrical & Telemetry Systems',
    keyPoints: [
      'Power Subsystem (Engineer): Select solar array wings or nuclear RTGs. Generation must strictly exceed base bus avionics (30W) plus active instruments.',
      'Comms Subsystem (Comms): Equip low-gain or high-gain dish antennas capable of downlinking daily data volume.',
      'Un-downlinked scientific data will be lost if your antenna bandwidth cannot keep pace with instrument output.',
    ],
    proTip: TUTORIAL_STEPS[2]?.proTip || 'At Mars and beyond, solar radiation drops dramatically (1/r² law). Consider using nuclear RTG batteries to avoid fatal power loss.',
    telemetryPreview: [
      { label: 'Power Generation', value: '350 W', status: 'nominal' },
      { label: 'Power Draw (Total)', value: '210 W', status: 'nominal' },
      { label: 'Net Power Margin', value: '+140 W', status: 'nominal' },
      { label: 'Downlink Bandwidth', value: '800 MB/day', status: 'nominal' },
    ],
  },
  {
    id: 5,
    badge: 'Lesson 5 · Launch Staging',
    role: 'MISSION PLANNER',
    roleKey: 'planner',
    title: 'Select Deployment Orbit & Rocket',
    subtitle: 'Integrate heavy rocket boosters and match orbital injection parameters',
    summary: TUTORIAL_STEPS[3]?.text || 'Pair your flight bus with a certified commercial launch vehicle for your target orbit.',
    imageSrc: '/images/rocket_launchpad.jpg',
    imageLabel: 'Launch Vehicle Integration · Commercial Boosters',
    keyPoints: [
      'Choose a target destination orbit compatible with your mission profile.',
      'Select a commercial launch vehicle (e.g. Falcon 9, Electron, Atlas V, Vulcan).',
      'Each rocket provides specific maximum payload capacity (kg) depending on the target orbit altitude.',
    ],
    proTip: TUTORIAL_STEPS[3]?.proTip || 'Rocket costs contribute directly to your total mission expenditure. Choose the most cost-effective launcher that safely accommodates your spacecraft wet mass.',
    telemetryPreview: [
      { label: 'Target Orbit', value: 'Low Earth Orbit (400 km)', status: 'nominal' },
      { label: 'Launcher Selected', value: 'Falcon 9 Heavy Lift', status: 'nominal' },
      { label: 'Max Payload Limit', value: '22,800 kg', status: 'nominal' },
      { label: 'Launch Vehicle Cost', value: '$67.0M USD', status: 'info' },
    ],
  },
  {
    id: 6,
    badge: 'Lesson 6 · Flight Dynamics',
    role: 'PROPULSION & AEROSPACE PHYSICS',
    roleKey: 'engineer',
    title: 'Manage Fuel, Mass & Delta-V Margins',
    subtitle: 'Balance physical flight margins to achieve positive velocity increment (Delta-V)',
    summary: 'Adjust onboard fuel reserves to meet orbital injection requirements without exceeding rocket lift capacity.',
    imageSrc: '/images/rocket_launchpad.jpg',
    imageLabel: 'Propulsion Dynamics · Delta-V & Injection Margins',
    keyPoints: [
      'Propellant Slider: Adjust onboard hydrazine fuel mass (kg) for orbital maneuvering and apogee burns.',
      'Delta-V Telemetry: The flight physics engine computes Required Trajectory Delta-V and Available Spacecraft Delta-V.',
      'Wet Mass vs Dry Mass: Adding fuel increases spacecraft Delta-V (via Tsiolkovsky equation) but consumes rocket payload capacity margin.',
      'Maintain positive Delta-V margin (+ km/s), positive net power (+ W), and positive payload margin (+ kg).',
    ],
    proTip: 'Watch the Launch Readiness indicators in the Orbit & Rocket workstation. Any red failure bar blocks launch authorization!',
    telemetryPreview: [
      { label: 'Spacecraft Wet Mass', value: '1,240 kg', status: 'nominal' },
      { label: 'Required Delta-V', value: '9.40 km/s', status: 'nominal' },
      { label: 'Available Delta-V', value: '11.85 km/s', status: 'nominal' },
      { label: 'Delta-V Flight Margin', value: '+2.45 km/s', status: 'nominal' },
    ],
  },
  {
    id: 7,
    badge: 'Lesson 7 · Flight Sign-Off',
    role: 'ALL FLIGHT OFFICERS',
    title: 'Multi-Role Flight Readiness Review',
    subtitle: 'Achieve consensus across Planner, Engineer, Science, and Comms stations',
    summary: TUTORIAL_STEPS[4]?.text || 'Pass the team approval gate before flight authorization can be granted.',
    imageSrc: '/images/mission-control-hero.jpg',
    imageLabel: 'Flight Readiness Review · Multi-Officer Consensus',
    keyPoints: [
      'Launch requires sign-off from all 4 roles: Planner, Engineer, Science, and Comms.',
      'In multiplayer mode, teammates sign off independently on their assigned subsystem.',
      'In single-player mode, switch roles via the subsystem tabs to review and approve each station.',
      'Safety Guard: Modifying any component, orbit, rocket, or propellant slider automatically resets all approvals to guarantee flight safety.',
    ],
    proTip: TUTORIAL_STEPS[4]?.proTip || 'Verify all 8 real-time engine checks (Mass, Power, Budget, Data, Comms, Lifetime, Launch Feasibility, Orbit Velocity) are passing before requesting approvals.',
    telemetryPreview: [
      { label: 'Planner Sign-Off', value: 'APPROVED', status: 'nominal' },
      { label: 'Engineer Sign-Off', value: 'APPROVED', status: 'nominal' },
      { label: 'Science Sign-Off', value: 'APPROVED', status: 'nominal' },
      { label: 'Comms Sign-Off', value: 'APPROVED', status: 'nominal' },
    ],
  },
  {
    id: 8,
    badge: 'Lesson 8 · Flight Debrief',
    role: 'MISSION CONTROL',
    title: 'Launch & Review Mission Report',
    subtitle: 'Execute high-fidelity flight simulation and inspect orbital debrief telemetry',
    summary: TUTORIAL_STEPS[5]?.text || 'Witness orbital playback, evaluate engineering anomalies, and benchmark against real NASA missions.',
    imageSrc: '/images/mission-control-hero.jpg',
    imageLabel: 'Flight Debrief · Simulation Telemetry & Benchmark',
    keyPoints: [
      'Click Launch Mission to run the Part A simulation engine with deterministic flight seeding.',
      'Observe real-time 3D/2D orbital maneuvers on the mission playback canvas.',
      'Review the flight chronology log: solar flares, micrometeorite strikes, and instrument milestones.',
      'Study engineering findings and compare your mission against historical NASA benchmarks.',
      'Use the Re-engineer Spacecraft button to adjust your design and improve your Science Score (out of 100).',
    ],
    proTip: TUTORIAL_STEPS[5]?.proTip || 'If your mission experiences an anomaly, inspect the debrief findings carefully to see if insufficient power, comms blackouts, or propellant depletion was the root cause.',
    telemetryPreview: [
      { label: 'Flight Status', value: 'MISSION SUCCESS', status: 'nominal' },
      { label: 'Science Score', value: '94 / 100 PTS', status: 'nominal' },
      { label: 'Historical Match', value: 'Lunar Reconnaissance Orbiter', status: 'info' },
      { label: 'Debrief Status', value: '100% NOMINAL', status: 'nominal' },
    ],
  },
]

export function Tutorial() {
  const navigate = useNavigate()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const activeStep = STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1
  const progressPercent = Math.round(((currentStepIndex + 1) / STEPS.length) * 100)

  // Find corresponding role guide if available
  const matchedRoleGuide = activeStep.roleKey
    ? ROLE_GUIDES.find((r) => r.role === activeStep.roleKey)
    : null

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleFinish = () => {
    navigate('/')
  }

  const handleSkip = () => {
    navigate('/')
  }

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (!isLastStep) setCurrentStepIndex((prev) => prev + 1)
      } else if (e.key === 'ArrowLeft') {
        if (!isFirstStep) setCurrentStepIndex((prev) => prev - 1)
      } else if (e.key === 'Escape') {
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFirstStep, isLastStep])

  return (
    <div className="space-y-8 pb-16 font-sans text-slate-100">
      {/* 1. ACADEMY HERO & ONBOARDING HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#334155]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[#273449] text-blue-300 border border-[#334155]">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Flight Academy · Cadet Onboarding
            </span>
            <span className="text-xs font-sans text-slate-400 hidden sm:inline">
              Academy Syllabus — 8 Lesson Modules
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            COSMOCRAFT Flight Academy
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed font-sans">
            Master the multi-disciplinary aerospace trade-offs of orbital mechanics, electrical power generation, deep-space telemetry links, and commercial rocket vehicle staging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 text-sm font-sans font-medium text-slate-300 hover:text-white bg-[#273449] hover:bg-[#334155] border border-[#334155] rounded-lg transition-colors cursor-pointer"
          >
            Skip to Mission Control
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE PHASE TIMELINE STEPPER */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400 uppercase tracking-normal font-semibold">Training Progress</span>
            <span className="text-slate-600">|</span>
            <span>
              Phase <span className="text-blue-400 font-bold font-mono">{currentStepIndex + 1}</span> of <span className="font-mono">{STEPS.length}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-white font-semibold">{activeStep.title}</span>
          </div>
          <span className="text-blue-400 font-semibold font-mono text-xs">{progressPercent}% Completed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#111827] rounded-full h-2 overflow-hidden border border-[#334155]">
          <div
            className="bg-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Horizontal Step Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {STEPS.map((step, idx) => {
            const isCurrent = idx === currentStepIndex
            const isCompleted = idx < currentStepIndex
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`py-2 px-2.5 rounded-lg font-sans text-xs text-left transition-all cursor-pointer flex flex-col justify-between border
                  ${isCurrent
                    ? 'bg-[#273449] text-white border-blue-400 font-bold shadow-none'
                    : isCompleted
                      ? 'bg-[#1E293B] text-slate-200 border-[#334155] hover:bg-[#273449]'
                      : 'bg-[#1E293B] text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#273449]'
                  }
                `}
                title={`Phase 0${step.id}: ${step.title}`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-xs font-mono ${isCurrent ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                    0{step.id}
                  </span>
                  {isCompleted && <span className="text-emerald-400 text-xs">✓</span>}
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                </div>
                <span className="truncate font-medium text-xs leading-tight block">
                  {step.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. ACTIVE PHASE WORKSTATION — TWO COLUMN COMPOSITION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: OPERATIONAL FLIGHT DIRECTIVE (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 sm:p-8 space-y-6 shadow-none relative overflow-hidden">
            {/* Header of Active Step */}
            <div className="border-b border-[#334155] pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="text-xs font-sans px-3 py-1 rounded-md font-semibold bg-[#273449] text-blue-300 border border-[#334155]">
                  {activeStep.badge}
                </span>
                <span className="text-xs font-sans text-slate-400">
                  Station Lead: <span className="text-white font-semibold">{activeStep.role}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
                {activeStep.title}
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed font-sans">
                {activeStep.subtitle}
              </p>
            </div>

            {/* Step Summary Briefing */}
            <div className="bg-[#273449] p-4 rounded-xl border border-[#334155] text-sm text-slate-200 leading-relaxed font-sans">
              <span className="text-blue-400 font-semibold mr-2 font-sans">Mission Directive ·</span>
              {activeStep.summary}
            </div>

            {/* Operational Guidelines & Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-sans uppercase tracking-normal text-slate-400 font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Operational Engineering Directives
              </h3>
              <ul className="space-y-2.5">
                {activeStep.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed bg-[#273449] p-3 rounded-lg border border-[#334155] font-sans">
                    <span className="text-blue-400 font-bold mt-0.5">▸</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* NASA Flight Director Pro-Tip */}
            <div className="p-4 sm:p-5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-sm font-sans flex items-start gap-3.5 shadow-none">
              <span className="text-amber-400 text-lg">💡</span>
              <div className="space-y-1">
                <span className="text-amber-300 font-semibold uppercase block text-xs">
                  Flight Director Operational Note
                </span>
                <p className="text-slate-200 leading-relaxed text-sm">
                  {activeStep.proTip}
                </p>
              </div>
            </div>

            {/* Matched Subsystem Role Guide (if applicable) */}
            {matchedRoleGuide && (
              <div className="p-4 rounded-xl bg-[#273449] border border-[#334155] space-y-2">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-blue-300 font-semibold uppercase">
                    Role Focus: {matchedRoleGuide.title}
                  </span>
                  <span className="text-slate-400">Subsystem Station</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {matchedRoleGuide.responsibility}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-sans">
                  {matchedRoleGuide.keyMetrics.map((metric, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-[#1E293B] border border-[#334155] text-slate-300">
                      • {metric}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CINEMATIC VISUAL THEATER & LIVE TELEMETRY SIMULATOR (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Cinematic Visual Theater */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden shadow-none">
            <div className="relative h-64 sm:h-72 w-full bg-slate-950">
              <img
                src={activeStep.imageSrc}
                alt={activeStep.title}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/30 to-transparent pointer-events-none" />

              {/* Top overlay badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur border border-white/10 text-xs font-sans text-blue-300 font-semibold">
                  {activeStep.imageLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-xs font-sans text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Satellite Model
                </span>
              </div>

              {/* Bottom overlay caption */}
              <div className="absolute bottom-3 left-4 right-4">
                <div className="text-xs font-sans text-slate-400 uppercase font-medium">
                  Training Topic:
                </div>
                <div className="text-sm font-sans font-bold text-white">
                  {activeStep.title}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Live Telemetry Simulation Mockup */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 space-y-5 shadow-none font-sans">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs text-slate-100 uppercase tracking-normal font-bold">
                  Live Telemetry Simulator
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#273449] border border-[#334155] text-slate-300">
                Lesson {activeStep.id} of {STEPS.length}
              </span>
            </div>

            {activeStep.telemetryPreview && (
              <div className="space-y-2.5">
                {activeStep.telemetryPreview.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#273449] border border-[#334155] flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-400 text-xs font-sans">{item.label}</span>
                    <span
                      className={`font-semibold font-mono ${
                        item.status === 'nominal'
                          ? 'text-blue-300'
                          : item.status === 'warning'
                            ? 'text-amber-300'
                            : 'text-slate-200'
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-[#334155] text-xs text-slate-400 text-center leading-relaxed">
              Aerospace telemetry calculated in accordance with flight physics engine specifications.
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACADEMY COMMAND BAR (PREV / NEXT NAVIGATION) */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-none">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all cursor-pointer border
              ${isFirstStep
                ? 'bg-[#111827] text-slate-600 border-[#334155]/60 cursor-not-allowed'
                : 'bg-[#273449] text-slate-200 border-[#334155] hover:bg-[#334155] hover:text-white'
              }
            `}
          >
            ← Previous Lesson
          </button>

          <Link
            to="/"
            className="px-4 py-2.5 rounded-lg font-sans text-sm text-slate-300 hover:text-white bg-[#273449] hover:bg-[#334155] border border-[#334155] text-center transition-colors"
          >
            Mission Catalog
          </Link>
        </div>

        <div className="text-xs font-sans text-slate-400 hidden md:block">
          Keyboard navigation: <kbd className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#334155] text-slate-300">←</kbd> Previous{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#334155] text-slate-300">→</kbd> Next{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#334155] text-slate-300">Esc</kbd> Exit
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 shadow-none"
          >
            <span>{isLastStep ? 'Begin Spacecraft Design (/) →' : 'Next Lesson →'}</span>
          </button>
        </div>
      </div>

      {/* 5. AEROSPACE LEXICON & TELEMETRY GLOSSARY */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#334155] pb-4">
          <h3 className="text-base font-bold font-sans uppercase tracking-normal text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Essential Aerospace Engineering Terminology
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Fundamental physical parameters and engineering metrics utilized by the flight simulation engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
          {/* 1. Delta-V */}
          <div className="p-4 bg-[#273449] rounded-xl border border-[#334155] space-y-2 hover:border-[#475569] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 text-sm">Delta-V (Δv)</span>
              <Tooltip termKey="deltaV">
                <span className="text-blue-400 text-xs cursor-help bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155]">ⓘ Def</span>
              </Tooltip>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Velocity increment (km/s) required to alter spacecraft orbit or complete planetary injection maneuvers.
            </p>
          </div>

          {/* 2. Payload Margin */}
          <div className="p-4 bg-[#273449] rounded-xl border border-[#334155] space-y-2 hover:border-[#475569] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 text-sm">Payload Margin</span>
              <Tooltip termKey="payloadMargin">
                <span className="text-blue-400 text-xs cursor-help bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155]">ⓘ Def</span>
              </Tooltip>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Remaining rocket lift capacity (kg) before reaching the booster vehicle's structural launch limit.
            </p>
          </div>

          {/* 3. Downlink Bandwidth */}
          <div className="p-4 bg-[#273449] rounded-xl border border-[#334155] space-y-2 hover:border-[#475569] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 text-sm">Downlink Bandwidth</span>
              <Tooltip termKey="downlink">
                <span className="text-blue-400 text-xs cursor-help bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155]">ⓘ Def</span>
              </Tooltip>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Volume of scientific telemetry (MB/day) successfully beamed back to NASA Deep Space Network tracking dishes.
            </p>
          </div>

          {/* 4. Nuclear RTG vs Solar */}
          <div className="p-4 bg-[#273449] rounded-xl border border-[#334155] space-y-2 hover:border-[#475569] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 text-sm">RTG Nuclear Power</span>
              <Tooltip termKey="rtg">
                <span className="text-blue-400 text-xs cursor-help bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155]">ⓘ Def</span>
              </Tooltip>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Plutonium decay heat generators providing continuous electrical power independent of solar distance (1/r² law).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
