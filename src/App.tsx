import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { MissionPicker, Builder, OrbitRocket, Report } from '@/screens'
import { Lobby, LocalTeamMode, useRoomSync } from '@/team'

function AppContent() {
  useRoomSync()

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <header className="border-b border-teal-900/40 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold tracking-wider text-teal-400">
          SPACE MISSION DESIGNER
        </div>
        <nav className="flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-teal-400 transition-colors">Mission</Link>
          <Link to="/lobby" className="hover:text-teal-400 transition-colors">Lobby</Link>
          <Link to="/build" className="hover:text-teal-400 transition-colors">Builder</Link>
          <Link to="/orbit-rocket" className="hover:text-teal-400 transition-colors">Orbit & Rocket</Link>
          <Link to="/report" className="hover:text-teal-400 transition-colors">Report</Link>
        </nav>
      </header>

      {/* Top pass-the-laptop banner (visible when mode === 'local') */}
      <LocalTeamMode />

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<MissionPicker />} />
          <Route path="/build" element={<Builder />} />
          <Route path="/orbit-rocket" element={<OrbitRocket />} />
          <Route path="/report" element={<Report />} />
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
