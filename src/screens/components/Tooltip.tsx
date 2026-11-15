// Owner: B. Accessible, NASA-inspired telemetry & definition tooltip popup.
import { useState, useId, useRef, useEffect, type ReactNode, type KeyboardEvent } from 'react'
import { TOOLTIPS } from '@/content/tooltips'

export interface TooltipProps {
  /** Optional manual text explanation. Overrides or falls back for termKey */
  text?: string
  /** Dictionary key looked up in @/content/tooltips (e.g., 'deltaV', 'downlink', 'payloadMargin') */
  termKey?: string
  /** Trigger element wrapped by the tooltip */
  children: ReactNode
  /** Additional custom classes for trigger container */
  className?: string
  /** Preferred display alignment relative to trigger */
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({
  text,
  termKey,
  children,
  className = '',
  position = 'top',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipId = useId()
  const containerRef = useRef<HTMLSpanElement>(null)

  // Resolve explanation text: termKey from content catalog -> manual text -> fallback
  const resolvedContent = (termKey && TOOLTIPS[termKey]) || text || 'Telemetry metric / design parameter definition.'

  // Close on Escape key
  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Escape' && isVisible) {
      e.stopPropagation()
      setIsVisible(false)
    }
  }

  // Close when clicking outside on mobile/touch screens
  useEffect(() => {
    if (!isVisible) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isVisible])

  // Positioning classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position]

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center group/tooltip focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--deepsky-blue-primary)] rounded ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onClick={() => setIsVisible((prev) => !prev)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}

      {/* Tooltip Popup Bubble */}
      {isVisible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute ${positionClasses} z-50 w-64 max-w-[calc(100vw-2rem)] p-3 rounded-lg text-xs leading-relaxed font-normal
            bg-[var(--deepsky-space-900)] text-slate-200 border border-[var(--deepsky-border-medium)] shadow-2xl backdrop-blur-md
            pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95`}
        >
          {termKey && (
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--deepsky-blue-primary)] font-bold mb-1.5 pb-1 border-b border-[var(--deepsky-border-subtle)]">
              SYS-DEF // {termKey}
            </span>
          )}
          <span className="block text-slate-300 font-sans text-xs leading-normal">
            {resolvedContent}
          </span>
        </span>
      )}
    </span>
  )
}
