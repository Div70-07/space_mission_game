// Owner: B. Info tooltip popup.
import type { ReactNode } from 'react'

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="relative group cursor-help inline-block">
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-xs text-white p-1 rounded z-10 whitespace-nowrap">
        {text}
      </span>
    </span>
  )
}
