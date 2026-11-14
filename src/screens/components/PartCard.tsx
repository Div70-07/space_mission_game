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

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`relative group rounded-lg p-4 transition-all duration-200 border flex flex-col justify-between cursor-pointer select-none
        ${selected
          ? 'bg-slate-900/90 border-teal-400 ring-1 ring-teal-400/50 shadow-md shadow-teal-950/60'
          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      title={disabled && disabledReason ? disabledReason : undefined}
    >
      <div>
        {/* Header / Category & Selection Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border
              ${isInst
                ? 'bg-purple-950/60 text-purple-300 border-purple-800/50'
                : item.kind === 'power'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                  : item.kind === 'antenna'
                    ? 'bg-sky-950/60 text-sky-300 border-sky-800/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
              }
            `}
          >
            {categoryLabel}
          </span>

          {selected && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-teal-300 font-semibold">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
              </svg>
              MOUNTED
            </span>
          )}
        </div>

        {/* Component Title */}
        <h3 className="font-semibold text-sm text-slate-100 tracking-wide mb-3 leading-snug">
          {item.name}
        </h3>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
          {/* Mass */}
          <div className="bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800/70 flex items-center justify-between">
            <span className="text-slate-400">Mass:</span>
            <span className="text-slate-200">{item.mass} {RESOURCE_UNITS.mass}</span>
          </div>

          {/* Power */}
          <div className="bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800/70 flex items-center justify-between">
            <span className="text-slate-400">Power:</span>
            <span className={`font-semibold ${item.power > 0 && !isInst && item.kind === 'power' ? 'text-emerald-400' : 'text-slate-200'}`}>
              {item.power > 0 && !isInst && item.kind === 'power' ? `+${item.power}` : item.power} {RESOURCE_UNITS.power}
            </span>
          </div>

          {/* Cost */}
          <div className="bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800/70 flex items-center justify-between">
            <span className="text-slate-400">Cost:</span>
            <span className="text-slate-200">${item.cost}M</span>
          </div>

          {/* Science Value or Downlink Rate */}
          {isInst ? (
            <div className="bg-purple-950/30 px-2 py-1.5 rounded border border-purple-900/50 flex items-center justify-between">
              <span className="text-purple-300">Science:</span>
              <span className="text-purple-200 font-bold">+{item.scienceValue}</span>
            </div>
          ) : (
            <div className="bg-sky-950/30 px-2 py-1.5 rounded border border-sky-900/50 flex items-center justify-between">
              <span className="text-sky-300">Downlink:</span>
              <span className="text-sky-200 font-medium">
                {item.downlinkPerDay} {RESOURCE_UNITS.downlinkPerDay}
              </span>
            </div>
          )}

          {/* Instrument Data Rate */}
          {isInst && (
            <div className="col-span-2 bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800/70 flex items-center justify-between">
              <span className="text-slate-400">Data Output:</span>
              <span className="text-slate-200">{item.dataPerDay} {RESOURCE_UNITS.dataPerDay}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Attribution & Action Indicator */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]" title={item.source}>
          SRC: {item.source}
        </span>

        <span
          className={`px-3 py-1 text-xs font-medium rounded transition-colors
            ${selected
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
              : 'bg-slate-800 text-slate-200 border border-slate-700 group-hover:bg-slate-700 group-hover:text-white'
            }
            ${disabled ? 'opacity-40' : ''}
          `}
        >
          {selected ? 'Remove' : 'Select'}
        </span>
      </div>
    </div>
  )
}
