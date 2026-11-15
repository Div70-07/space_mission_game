// Owner: B. Mission component card representing an Instrument or Spacecraft Part.
import type { KeyboardEvent } from 'react'
import type { Instrument, Part } from '@/shared/types'
import { RESOURCE_UNITS } from '@/shared/constants'

export interface PartCardProps {
  /** The payload instrument or spacecraft subsystem component */
  item: Instrument | Part
  /** Whether this component is currently selected in the design */
  selected?: boolean
  /** Whether the component is disabled (e.g. mutually exclusive or restricted by role) */
  disabled?: boolean
  /** Optional tooltip explanation if disabled */
  disabledReason?: string
  /** Callback fired when the selection state is toggled */
  onToggle?: () => void
  /** Optional custom class name */
  className?: string
}

function isInstrument(item: Instrument | Part): item is Instrument {
  return 'scienceValue' in item
}

// Operational aerospace descriptions for each component
const COMPONENT_DESCRIPTIONS: Record<string, string> = {
  'camera-highres': 'High-resolution telescopic optical camera capturing fine-scale geomorphology and surface features.',
  'spectrometer-ir': 'Hyperspectral infrared sensor mapping hydrated minerals, ice deposits, and surface composition.',
  'radar-altimeter': 'Cloud-penetrating radar profiling planetary surface topography and roughness characteristics.',
  'mag-plasma': 'Deployable boom measuring local planetary magnetic fields and ambient solar wind plasma interactions.',
  'thermal-radiometer': 'Multispectral radiometer measuring surface brightness temperature, thermal inertia, and regolith properties.',
  'neutron-spectrometer': 'Nuclear detector measuring epithermal neutrons to identify subsurface hydrogen and water ice.',
  'atmospheric-lidar': 'Pulsed laser sounder measuring atmospheric aerosol density, cloud layers, and vertical profiles.',
  'uv-spectrograph': 'Ultraviolet spectrometer analyzing atmospheric escape, auroral emissions, and gaseous species.',
  'subsurface-radar': 'Long-wavelength sounding radar penetrating planetary crust to detect buried ice sheets and aquifers.',
  'dust-analyzer': 'Impact ionization detector measuring cosmic and interplanetary dust grain mass and chemical makeup.',
  'solar-panel-std': 'Deployable triple-junction photovoltaic panels providing steady power in inner solar system environments.',
  'solar-panel-advanced': 'Accordion-deployed circular UltraFlex array offering high specific power and orbital resilience.',
  'rtg-mmrtg': 'Plutonium-238 thermoelectric nuclear generator delivering continuous power independent of sunlight.',
  'rtg-nextgen': 'High-yield radioisotope generator engineered for outer planet exploration and extreme environments.',
  'antenna-omni': 'Low-gain quasi-omnidirectional antenna providing baseline telemetry and contingency ground uplink.',
  'antenna-mga': 'Medium-gain steerable horn antenna offering balanced scientific downlink throughput.',
  'antenna-hga': 'High-gain Cassegrain parabolic dish reflector maximizing deep-space data transmission to Earth.',
  'antenna-ka': 'Deep-space optical laser terminal and Ka-band transceiver maximizing interplanetary science returns.',
  'bus-structure-standard': 'High-strength aluminum-honeycomb core bus integrated directly into flight avionics baselines.',
}

export function PartCard({
  item,
  selected = false,
  disabled = false,
  disabledReason,
  onToggle,
  className = '',
}: PartCardProps) {
  const isInst = isInstrument(item)
  const categoryLabel = isInst ? 'Instrument' : item.kind.toUpperCase()
  const description = COMPONENT_DESCRIPTIONS[item.id] || item.source

  const handleCardClick = () => {
    if (!disabled && onToggle) {
      onToggle()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle?.()
    }
  }

  // Subsystem specific category styling
  const isPower = !isInst && item.kind === 'power'
  const isComms = !isInst && item.kind === 'antenna'

  const categoryStyle = isInst
    ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
    : isPower
      ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
      : isComms
        ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
        : 'bg-slate-900 text-slate-300 border-slate-700'

  const selectedClass = selected
    ? isInst
      ? 'deepsky-card-selected-science'
      : isPower
        ? 'deepsky-card-selected-power'
        : isComms
          ? 'deepsky-card-selected-comms'
          : 'deepsky-card-selected'
    : 'deepsky-card'

  const annunciatorStyle = isInst
    ? 'bg-[#1E293B] text-purple-300 border border-purple-600/60 shadow-none'
    : isPower
      ? 'bg-[#1E293B] text-amber-300 border border-amber-600/60 shadow-none'
      : isComms
        ? 'bg-[#1E293B] text-blue-300 border border-blue-500/60 shadow-none'
        : 'bg-[#1E293B] text-blue-300 border border-blue-500/60 shadow-none'

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`relative group rounded-xl p-4 transition-all duration-150 border flex flex-col justify-between cursor-pointer select-none deepsky-focus-ring shadow-none
        ${selectedClass}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      title={disabled && disabledReason ? disabledReason : undefined}
    >
      <div>
        {/* Header: Subsystem Category & Selection Annunciator */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-xs font-sans font-semibold px-2.5 py-0.5 rounded border ${categoryStyle}`}>
            {categoryLabel}
          </span>

          {selected && (
            <span className={`deepsky-annunciator ${annunciatorStyle}`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
              </svg>
              MOUNTED
            </span>
          )}
        </div>

        {/* Component Title */}
        <h3 className="font-bold text-base text-slate-100 tracking-normal mb-1 leading-snug font-sans">
          {item.name}
        </h3>

        {/* Operational Description */}
        <p className="text-sm text-slate-400 font-sans mb-3 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Technical Specifications Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Mass Spec */}
          <div className="bg-[var(--deepsky-space-900)] px-2.5 py-1.5 rounded-lg border border-[var(--deepsky-border-subtle)] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-sans">Mass:</span>
            <span className="text-xs text-slate-200 font-mono deepsky-num font-semibold">{item.mass} {RESOURCE_UNITS.mass}</span>
          </div>

          {/* Power Spec */}
          <div className="bg-[var(--deepsky-space-900)] px-2.5 py-1.5 rounded-lg border border-[var(--deepsky-border-subtle)] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-sans">Power:</span>
            <span className={`text-xs font-mono font-semibold deepsky-num ${item.power > 0 && !isInst && item.kind === 'power' ? 'text-[var(--deepsky-telemetry-nominal)]' : 'text-slate-200'}`}>
              {item.power > 0 && !isInst && item.kind === 'power' ? `+${item.power}` : item.power} {RESOURCE_UNITS.power}
            </span>
          </div>

          {/* Cost Spec */}
          <div className="bg-[var(--deepsky-space-900)] px-2.5 py-1.5 rounded-lg border border-[var(--deepsky-border-subtle)] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-sans">Cost:</span>
            <span className="text-xs text-slate-200 font-mono deepsky-num font-semibold">${item.cost}M</span>
          </div>

          {/* Science Value or Downlink Rate */}
          {isInst ? (
            <div className="bg-purple-950/30 px-2.5 py-1.5 rounded-lg border border-purple-800/40 flex items-center justify-between">
              <span className="text-xs text-purple-300 font-sans">Science:</span>
              <span className="text-xs text-purple-200 font-mono font-bold deepsky-num">+{item.scienceValue} pts</span>
            </div>
          ) : (
            <div className="bg-[#1E293B] px-2.5 py-1.5 rounded-lg border border-blue-800/40 flex items-center justify-between">
              <span className="text-xs text-blue-300 font-sans">Downlink:</span>
              <span className="text-xs text-slate-200 font-mono font-semibold deepsky-num">
                {item.downlinkPerDay} {RESOURCE_UNITS.downlinkPerDay}
              </span>
            </div>
          )}

          {/* Instrument Data Rate Output */}
          {isInst && (
            <div className="col-span-2 bg-[var(--deepsky-space-900)] px-2.5 py-1.5 rounded-lg border border-[var(--deepsky-border-subtle)] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-sans">Data Output:</span>
              <span className="text-xs text-slate-200 font-mono deepsky-num font-semibold">{item.dataPerDay} {RESOURCE_UNITS.dataPerDay}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Select or Remove Action Button */}
      <div className="mt-1 pt-2.5 border-t border-[var(--deepsky-border-subtle)] flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500 font-sans truncate max-w-[130px]" title={item.source}>
          {item.source.split('(')[0]}
        </span>

        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled && onToggle) onToggle()
          }}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-sans font-semibold tracking-normal transition-colors flex items-center gap-1.5 cursor-pointer shadow-none
            ${selected
              ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800'
              : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500'
            }
            ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
          `}
        >
          {selected ? (
            <>
              <span>✕</span>
              <span>Remove</span>
            </>
          ) : (
            <>
              <span>+</span>
              <span>Select</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
