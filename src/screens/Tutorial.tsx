// Owner: B. Interactive tutorial and flight director onboarding workstation.
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TUTORIAL_STEPS } from '@/content/tutorial'
import { Tooltip } from './components/Tooltip'

interface TutorialStep {
  id: number
  badge: string
  role: string
  title: string
  subtitle: string
  summary: string
  keyPoints: string[]
  proTip: string
  telemetryPreview?: {
    label: string
    value: string
    status: 'nominal' | 'warning' | 'info'
  }[]
}

const STEPS: TutorialStep[] = [
  {
    id: 1,
    badge: 'PHASE 01 // SELECTION',
    role: 'FLIGHT DIRECTOR',
    title: 'Select Your Mission',
    subtitle: 'Establish mission destination, scientific charter, and fiscal constraints',
    summary: TUTORIAL_STEPS[0]?.text || 'Choose your scientific destination and constraints.',
    keyPoints: [
      'Browse missions categorized by difficulty level (Level 1: Earth-Moon, Level 2: Inner Planets, Level 3: Deep Space).',
      'Each mission establishes a strict capital budget ceiling (in Millions USD) and operational lifetime (months).',
      'Review target destinations and primary science goals before selecting your spacecraft design profile.',
    ],
    proTip: 'Beginner flight architects should start with Level 1 missions (like Lunar Reconnaissance) to master core mass and power tradeoffs before tackling interplanetary trajectories.',
    telemetryPreview: [
      { label: 'Classification', value: 'Level 1 Lunar Explorer', status: 'nominal' },
      { label: 'Budget Ceiling', value: '$120.0M USD', status: 'nominal' },
      { label: 'Minimum Lifetime', value: '24 Months', status: 'info' },
    ],
  },
  {
    id: 2,
    badge: 'PHASE 02 // OBJECTIVES',
    role: 'MISSION ARCHITECT',
    title: 'Understand Mission Objectives',
    subtitle: 'Analyze orbital requirements, science thresholds, and environmental limits',
    summary: 'Analyze operational requirements to tailor your spacecraft architecture.',
    keyPoints: [
      'Each mission specifies target trajectory orbits (e.g. LEO, Polar SSO, Lunar Orbit, Mars Insertion).',
      'Minimum science thresholds dictate the required scientific instrumentation capacity.',
      'Operational lifetime defines how long your components and power sources must survive space radiation.',
    ],
    proTip: 'Study the mission trajectory requirements early: deep-space destinations demand higher velocity increments (Delta-V) and resilient power sources.',
    telemetryPreview: [
      { label: 'Target Orbits', value: 'LEO / Lunar Orbit', status: 'nominal' },
      { label: 'Target Science', value: 'Min. 50 Science Pts', status: 'info' },
      { label: 'Destination Range', value: '384,400 km', status: 'nominal' },
    ],
  },
  {
    id: 3,
    badge: 'PHASE 03 // PAYLOAD BAY',
    role: 'SCIENCE OFFICER',
    title: 'Choose Scientific Instruments',
    subtitle: 'Integrate cameras, spectrometers, and magnetometers to maximize science yield',
    summary: 'Mount specialized scientific instruments to collect mission data.',
    keyPoints: [
      'The Science role manages the payload bay in the Builder workstation.',
      'Each instrument yields science value points and generates scientific data (MB/day).',
      'Instruments consume electrical power (Watts) and add physical mass (kg) to the spacecraft bus.',
    ],
    proTip: 'Avoid over-equipping early: mounting too many instruments can quickly exceed your electrical power reserves and overload your communications downlink.',
    telemetryPreview: [
      { label: 'Payload Mass', value: '145 kg', status: 'nominal' },
      { label: 'Data Production', value: '620 MB/day', status: 'info' },
      { label: 'Power Consumption', value: '180 W', status: 'warning' },
    ],
  },
  {
    id: 4,
    badge: 'PHASE 04 // BUS SYSTEMS',
    role: 'ENGINEER & COMMS',
    title: 'Configure Power & Communications',
    subtitle: 'Balance electrical generation and ground station telemetry downlink bandwidth',
    summary: 'Ensure your satellite generates enough power and can transmit all scientific data home.',
    keyPoints: [
      'Power Subsystem (Engineer): Select solar array wings or RTGs. Power generation must strictly exceed base bus avionics (30W) plus active instruments.',
      'Comms Subsystem (Comms): Equip low-gain or high-gain dish antennas capable of downlinking daily data volume.',
      'Un-downlinked scientific data will be lost if your antenna bandwidth cannot keep pace with instrument output.',
    ],
    proTip: 'Deep space missions receive negligible solar irradiance. At Mars and beyond, consider nuclear RTG power systems to avoid fatal battery exhaustion during eclipse phases.',
    telemetryPreview: [
      { label: 'Power Generation', value: '350 W', status: 'nominal' },
      { label: 'Power Draw (Total)', value: '210 W', status: 'nominal' },
      { label: 'Net Power Margin', value: '+140 W', status: 'nominal' },
      { label: 'Downlink Bandwidth', value: '800 MB/day', status: 'nominal' },
    ],
  },
  {
    id: 5,
    badge: 'PHASE 05 // LAUNCH STAGING',
    role: 'MISSION PLANNER',
    title: 'Select Orbit & Launch Vehicle',
    subtitle: 'Integrate heavy rocket boosters and match orbital trajectory requirements',
    summary: 'Pair your flight bus with a certified commercial launch vehicle for your target orbit.',
    keyPoints: [
      'Choose a target destination orbit compatible with your mission profile.',
      'Select a commercial launch vehicle (e.g. Falcon 9, Electron, Atlas V, Vulcan).',
      'Each rocket provides specific maximum payload capacity (kg) depending on the target orbit altitude.',
    ],
    proTip: 'Rocket costs contribute directly to your total mission expenditure. Choose the most cost-effective launcher that safely accommodates your spacecraft wet mass.',
    telemetryPreview: [
      { label: 'Target Orbit', value: 'Low Earth Orbit (400 km)', status: 'nominal' },
      { label: 'Launcher Selected', value: 'Falcon 9 Heavy Lift', status: 'nominal' },
      { label: 'Max Payload Limit', value: '22,800 kg', status: 'nominal' },
      { label: 'Launch Vehicle Cost', value: '$67.0M USD', status: 'info' },
    ],
  },
  {
    id: 6,
    badge: 'PHASE 06 // FLIGHT DYNAMICS',
    role: 'PROPULSION & PHYSICS',
    title: 'Manage Fuel, Mass, Power & Budget',
    subtitle: 'Balance physical flight margins to achieve positive velocity increment (Delta-V)',
    summary: TUTORIAL_STEPS[1]?.text || 'Keep mass, power, cost, data, and communications balanced.',
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
    badge: 'PHASE 07 // FLIGHT SIGN-OFF',
    role: 'ALL FLIGHT OFFICERS',
    title: 'Obtain Team Approvals',
    subtitle: 'Achieve consensus across Planner, Engineer, Science, and Comms roles',
    summary: 'Pass the Part C team approval gate before flight authorization can be granted.',
    keyPoints: [
      'Launch requires sign-off from all 4 roles: Planner, Engineer, Science, and Comms.',
      'In multiplayer mode, teammates sign off independently on their assigned subsystem.',
      'In single-player mode, switch roles via the subsystem tabs to review and approve each station.',
      'Safety Guard: Modifying any component, orbit, rocket, or propellant slider automatically resets all approvals to guarantee flight safety.',
    ],
    proTip: 'Verify all 8 real-time engine checks (Mass, Power, Budget, Data, Comms, Lifetime, Launch Feasibility, Orbit Velocity) are passing before requesting approvals.',
    telemetryPreview: [
      { label: 'Planner Sign-Off', value: 'APPROVED', status: 'nominal' },
      { label: 'Engineer Sign-Off', value: 'APPROVED', status: 'nominal' },
      { label: 'Science Sign-Off', value: 'APPROVED', status: 'nominal' },
      { label: 'Comms Sign-Off', value: 'APPROVED', status: 'nominal' },
    ],
  },
  {
    id: 8,
    badge: 'PHASE 08 // FLIGHT DEBRIEF',
    role: 'MISSION CONTROL',
    title: 'Launch & Review Mission Report',
    subtitle: 'Execute high-fidelity flight simulation and inspect mission debrief telemetry',
    summary: 'Witness orbital playback, evaluate engineering anomalies, and benchmark against real NASA missions.',
    keyPoints: [
      'Click Launch Mission to run the Part A simulation engine with deterministic flight seeding.',
      'Observe real-time 3D/2D orbital maneuvers on the mission playback canvas.',
      'Review the flight chronology log: solar flares, micrometeorite strikes, and instrument milestones.',
      'Study engineering findings and compare your mission against historical NASA benchmarks.',
      'Use the Re-engineer Spacecraft button to adjust your design and improve your Science Score (out of 100).',
    ],
    proTip: 'If your mission experiences an anomaly, inspect the debrief findings carefully to see if insufficient power, comms blackouts, or propellant depletion was the root cause.',
    telemetryPreview: [
      { label: 'Flight Status', value: 'MISSION SUCCESS', status: 'nominal' },
      { label: 'Science Score', value: '94 / 100 PTS', status: 'nominal' },
      { label: 'Historical Match', value: 'Lunar Reconnaissance Orbiter', status: 'info' },
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
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans">
      {/* 1. TOP HEADER & WORKSTATION BANNER */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-teal-400 uppercase font-semibold">
              FLIGHT ACADEMY // OPERATIONAL ONBOARDING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tracking-tight">
            SPACE MISSION DESIGNER TUTORIAL
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Master the multi-disciplinary aerospace trade-offs of mass, electrical power, communications bandwidth, orbital trajectory physics, and fiscal constraints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Skip Tutorial
          </button>
        </div>
      </div>

      {/* 2. PROGRESS STEPPER TIMELINE */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            STEP <span className="text-teal-300 font-bold">{currentStepIndex + 1}</span> OF {STEPS.length}
          </span>
          <span className="text-teal-400 font-semibold">{progressPercent}% COMPLETE</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-teal-500 to-teal-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Horizontal Step Buttons */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 pt-2 no-scrollbar">
          {STEPS.map((step, idx) => {
            const isCurrent = idx === currentStepIndex
            const isCompleted = idx < currentStepIndex
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex-1 min-w-[36px] py-1.5 px-2 rounded font-mono text-xs text-center transition-all cursor-pointer truncate
                  ${isCurrent
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm shadow-teal-500/30'
                    : isCompleted
                      ? 'bg-slate-900/90 text-teal-300 border border-teal-800/40 hover:bg-slate-800'
                      : 'bg-slate-900/40 text-slate-500 border border-slate-800 hover:text-slate-300 hover:bg-slate-900'
                  }
                `}
                title={`Step ${step.id}: ${step.title}`}
              >
                <span className="hidden sm:inline">0{step.id} </span>
                <span className="truncate">{step.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. ACTIVE STEP DETAIL WORKSTATION */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header of Active Step */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border font-semibold bg-teal-950/60 text-teal-300 border-teal-800/60">
              {activeStep.badge}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              PRIMARY OFFICER: <span className="text-slate-200 font-semibold">{activeStep.role}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-100 tracking-tight">
            {activeStep.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            {activeStep.subtitle}
          </p>
        </div>

        {/* Step Core Explanation & Key Principles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              {activeStep.summary}
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Operational Guidelines & Checklist
              </h3>
              <ul className="space-y-2">
                {activeStep.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <span className="text-teal-400 font-mono font-bold mt-0.5">▸</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* NASA Engineering Pro-Tip */}
            <div className="p-4 rounded-lg bg-teal-950/30 border border-teal-800/40 text-xs font-mono flex items-start gap-3">
              <span className="text-teal-400 text-base font-bold">💡</span>
              <div>
                <span className="text-teal-300 font-semibold block mb-0.5">FLIGHT DIRECTOR NOTE:</span>
                <span className="text-slate-300 leading-relaxed">{activeStep.proTip}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Telemetry Simulation Mockup */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between font-mono">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-[10px] text-teal-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                  Live Telemetry Mockup
                </span>
                <span className="text-[10px] text-slate-500">STAGE #{activeStep.id}</span>
              </div>

              {activeStep.telemetryPreview && (
                <div className="space-y-2.5">
                  {activeStep.telemetryPreview.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-400 text-[11px]">{item.label}</span>
                      <span
                        className={`font-semibold ${
                          item.status === 'nominal'
                            ? 'text-teal-300'
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
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
              Aerospace telemetry calculated in accordance with Part A physics engine specifications.
            </div>
          </div>
        </div>

        {/* 4. NAVIGATION ACTION CONTROLS */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer border
                ${isFirstStep
                  ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700'
                }
              `}
            >
              ← Previous Step
            </button>

            <Link
              to="/"
              className="px-4 py-2.5 rounded-lg font-mono text-xs text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800 text-center transition-colors"
            >
              Catalog (/)
            </Link>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleNext}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-lg font-mono text-xs font-semibold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2
                ${isLastStep
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-950/50'
                }
              `}
            >
              <span>{isLastStep ? 'Begin Mission Design (/) 🚀' : 'Next Step →'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. QUICK REFERENCE GLOSSARY CARDS */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200">
            Key Aerospace Terminology Reference
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Essential concepts utilized by the flight physics engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-300">Delta-V ($\Delta v$)</span>
              <Tooltip termKey="deltaV">
                <span className="text-teal-400 text-[10px] cursor-help">ⓘ Info</span>
              </Tooltip>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Velocity increment (km/s) required to alter spacecraft orbit or complete planetary injection.
            </p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-300">Payload Margin</span>
              <Tooltip termKey="payloadMargin">
                <span className="text-teal-400 text-[10px] cursor-help">ⓘ Info</span>
              </Tooltip>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Remaining rocket lift capacity (kg) before reaching the launcher's structural injection limit.
            </p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-300">Downlink Bandwidth</span>
              <Tooltip termKey="downlink">
                <span className="text-teal-400 text-[10px] cursor-help">ⓘ Info</span>
              </Tooltip>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Volume of scientific telemetry (MB/day) successfully transmitted back to Earth tracking ground stations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
