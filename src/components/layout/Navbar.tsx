import { logout, getCurrentUser } from '../../api/services'
import { useNavigate } from 'react-router-dom'

interface NavbarProps {
  activeAlerts: number
  lastSync:     string
}

export default function Navbar({ activeAlerts, lastSync }: NavbarProps) {
  const navigate = useNavigate()
  const user = getCurrentUser()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav
      style={{ background: '#0f172a', borderBottom: '1px solid rgba(148,163,184,0.12)' }}
      className="flex items-center justify-between px-6 h-13 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
          stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 3 L19 7 L19 11 C19 15.4 15.4 19.3 11 21 C6.6 19.3 3 15.4 3 11 L3 7 Z"/>
          <circle cx="11" cy="11" r="2.5"/>
          <path d="M11 8.5L11 3.5M11 13.5L11 18.5M13.5 11L18.5 11M8.5 11L3.5 11"/>
        </svg>
        <span className="text-sm font-medium tracking-widest" style={{ color: '#22d3ee' }}>
          SENTINEL IoT
        </span>
      </div>

      {/* Centro: estado ESP32 */}
      <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
        <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: '#10b981' }}/>
        ESP32-SENTINEL-001 · Sincronizado {lastSync}
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-4">
        {activeAlerts > 0 && (
          <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md"
            style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#f43f5e' }}/>
            {activeAlerts} alerta{activeAlerts !== 1 ? 's' : ''}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium" style={{ color: '#cbd5e1' }}>{user?.name ?? 'Usuario'}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{user?.role ?? ''}</p>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: '#0e7490', color: '#22d3ee' }}>
            {user?.avatar ?? '??'}
          </div>
          <button onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{ color: '#64748b', border: '1px solid rgba(148,163,184,0.12)' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = '#22d3ee' }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = '#64748b' }}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
