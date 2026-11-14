import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { MissionPicker, Builder, OrbitRocket, Report } from '@/screens'
import { Lobby } from '@/team'

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
        <header className="border-b border-teal-900/40 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold tracking-wider text-teal-400">
            SPACE MISSION DESIGNER
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-teal-400 transition-colors">Mission</Link>
            <Link to="/build" className="hover:text-teal-400 transition-colors">Builder</Link>
            <Link to="/orbit-rocket" className="hover:text-teal-400 transition-colors">Orbit & Rocket</Link>
            <Link to="/report" className="hover:text-teal-400 transition-colors">Report</Link>
            <Link to="/lobby" className="hover:text-teal-400 transition-colors">Lobby</Link>
          </nav>
        </header>

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
    </BrowserRouter>
  )
}

export default App
