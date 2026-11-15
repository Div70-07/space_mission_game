import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { MissionPicker, Builder, OrbitRocket, Report, Tutorial, MissionExecution } from '@/screens'
import { Lobby, LocalTeamMode, useRoomSync } from '@/team'

/* ========================================================================= */
/* COSMOCRAFT CUSTOM ORBITAL PLANET LOGO                                    */
/* ========================================================================= */
function CosmocraftLogo() {
  return (
    <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
      <svg
        className="w-full h-full text-blue-400 select-none"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        {/* Outer inclined orbital ellipse */}
        <ellipse
          cx="18"
          cy="18"
          rx="15"
          ry="5.5"
          transform="rotate(-28 18 18)"
          stroke="#334155"
          strokeWidth="1.25"
          strokeDasharray="4 2"
          className="opacity-60"
        />
        <ellipse
          cx="18"
          cy="18"
          rx="15"
          ry="5.5"
          transform="rotate(-28 18 18)"
          stroke="url(#cosmo-orbit)"
          strokeWidth="1.75"
        />

        {/* Central Planet Sphere with core and atmospheric rim */}
        <circle cx="18" cy="18" r="8" fill="url(#cosmo-planet)" stroke="#60A5FA" strokeWidth="1.2" />
        <circle cx="18" cy="18" r="8" fill="url(#cosmo-shadow)" />

        {/* Orbiting Satellite Node */}
        <circle cx="29.5" cy="12" r="2" fill="#60A5FA" />
        <circle cx="29.5" cy="12" r="3.75" fill="none" stroke="#60A5FA" strokeWidth="0.75" opacity="0.6" />

        <defs>
          <linearGradient id="cosmo-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#2563EB" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          <radialGradient id="cosmo-planet" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="60%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>
          <radialGradient id="cosmo-shadow" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.35" />
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

/* ========================================================================= */
/* AUTHENTIC LUCIDE ICONS (ZERO-DEPENDENCY INLINE SVGS)                      */
/* ========================================================================= */
function GlobeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

function UsersIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function LayersIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  )
}

function RocketIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

function FileTextIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}

function GraduationCapIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  )
}

function MenuIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function XIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

/* ========================================================================= */
/* NAVIGATION ROUTES DEFINITION                                              */
/* ========================================================================= */
const NAV_ITEMS = [
  { to: '/', label: 'Mission Control', icon: GlobeIcon },
  { to: '/lobby', label: 'Crew Lobby', icon: UsersIcon },
  { to: '/build', label: 'Spacecraft Builder', icon: LayersIcon },
  { to: '/orbit-rocket', label: 'Orbit & Rocket', icon: RocketIcon },
  { to: '/report', label: 'Mission Reports', icon: FileTextIcon },
  { to: '/tutorial', label: 'Tutorial Academy', icon: GraduationCapIcon },
]

function AppContent() {
  useRoomSync()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isNavActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    if (to === '/orbit-rocket') return location.pathname === '/orbit-rocket' || location.pathname === '/execution'
    return location.pathname.startsWith(to)
  }

  const isBuilder = location.pathname === '/build'
  const isWorkstation =
    isBuilder ||
    location.pathname === '/orbit-rocket' ||
    location.pathname === '/execution'

  return (
    <div className={`${isWorkstation ? 'min-h-screen xl:h-screen xl:overflow-hidden' : 'min-h-screen'} bg-[#111827] text-gray-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200`}>
      {/* ========================================================================= */}
      {/* GLOBAL COSMOCRAFT NAVBAR                                                  */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 shrink-0 border-b border-[#334155] bg-[#1E293B]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Wordmark */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg p-1 transition-transform"
          >
            <CosmocraftLogo />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-[0.15em] font-sans text-white group-hover:text-blue-400 transition-colors">
                COSMOCRAFT
              </span>
              <span className="text-xs font-sans text-slate-400 tracking-normal hidden sm:block">
                Aerospace Mission Exploration
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Global Navigation">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item.to)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-sans tracking-wide transition-all duration-150 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    active
                      ? 'bg-[#273449] text-white border-[#334155] font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#273449]/60 border-transparent font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-400 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Collapsible Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-lg bg-[#273449] border border-[#334155] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
            >
              {mobileMenuOpen ? <XIcon className="w-5 h-5 text-blue-400" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Dropdown Navigation */}
        {mobileMenuOpen && (
          <nav
            className="lg:hidden mt-2 pt-2 border-t border-[#334155] space-y-1 animate-fade-in"
            aria-label="Mobile Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item.to)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-sans transition-colors border ${
                    active
                      ? 'bg-[#273449] text-white border-[#334155] font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-[#273449]/60 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        )}
      </header>

      {/* Top pass-the-laptop banner (visible when mode === 'local') */}
      <LocalTeamMode />

      <main className={`flex-1 min-h-0 ${isWorkstation ? 'p-2.5 sm:p-3.5 xl:p-3 flex flex-col xl:overflow-hidden' : 'p-4 sm:p-6'}`}>
        <Routes>
          <Route path="/" element={<MissionPicker />} />
          <Route path="/build" element={<Builder />} />
          <Route path="/orbit-rocket" element={<OrbitRocket />} />
          <Route path="/execution" element={<MissionExecution />} />
          <Route path="/report" element={<Report />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/lobby" element={<Lobby />} />
        </Routes>
      </main>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
