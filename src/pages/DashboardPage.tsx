import { useState } from 'react'
import Navbar      from '../components/layout/Navbar'
import SensorGrid  from '../components/sensors/SensorGrid'
import AlertItem   from '../components/alerts/AlertItem'
import EventTable  from '../components/history/EventTable'
import { useSensors } from '../hooks/useSensors'
import { useEvents  } from '../hooks/useEvents'
import { useAlerts  } from '../hooks/useAlerts'
import { usePermissions } from '../hooks/usePermissions'
import UserList from '../components/users/UserList'
import MOCK_USERS from '../api/users.json'

type Tab = 'monitoreo' | 'alertas' | 'historial'| 'usuarios'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-widest mb-3"
      style={{ color: '#64748b', textTransform: 'uppercase' }}>
      {children}
    </p>
  )
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('monitoreo')

  const { sensors, loading: loadSensors } = useSensors(8000)
  const { events,  loading: loadEvents  } = useEvents(50)
  const { alerts,  loading: loadAlerts, acknowledge } = useAlerts()
  const { can } = usePermissions()

  const activeAlerts  = alerts.filter(a => !a.acknowledged).length
  const criticalCount = alerts.filter(a => a.level === 'critical' && !a.acknowledged).length

  const TABS: { id: Tab; label: string }[] = [
    { id: 'monitoreo', label: 'Monitoreo'  },
    { id: 'alertas',   label: 'Alertas'    },
    { id: 'historial', label: 'Historial'  },
    { id: 'usuarios',  label: 'Usuarios'   },
  ]

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navbar activeAlerts={activeAlerts} lastSync="hace 3 s" />

      {/* Barra de estado crítico */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-2 px-6 py-2 text-xs"
          style={{ background: 'rgba(244,63,94,0.08)', borderBottom: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#f43f5e' }}/>
          {criticalCount} alerta{criticalCount !== 1 ? 's' : ''} crítica{criticalCount !== 1 ? 's' : ''} sin atender
          <button className="ml-2 underline cursor-pointer" style={{ color: '#f43f5e' }}
            onClick={() => setTab('alertas')}>
            Ver alertas
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid rgba(148,163,184,0.12)', background: '#0f172a' }}>
        {TABS
        .filter(t => t.id !== 'usuarios' || can('manage_users'))
        .map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-5 py-3 text-sm cursor-pointer transition-colors relative"
            style={{
              color:        tab === t.id ? '#22d3ee' : '#64748b',
              background:   'transparent',
              border:       'none',
              borderBottom: tab === t.id ? '2px solid #22d3ee' : '2px solid transparent',
            }}>
            {t.label}
            {t.id === 'alertas' && activeAlerts > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>
                {activeAlerts}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <main className="flex-1 overflow-auto p-5 md:p-6">

        {/* ── MONITOREO ── */}
        {tab === 'monitoreo' && (
          <div>
            <SectionTitle>Estado de sensores · ESP32</SectionTitle>
            <SensorGrid sensors={sensors} loading={loadSensors} />

            <div className="mt-6">
              <SectionTitle>Últimas detecciones</SectionTitle>
              {loadEvents ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-14 animate-pulse rounded-xl"
                      style={{ background: '#1e293b' }}/>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {events.slice(0, 5).map(e => {
                    const colors: Record<string, string> = {
                      motion: '#f59e0b', door: '#22d3ee', auth: '#10b981', alert: '#f43f5e',
                    }
                    return (
                      <div key={e.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)' }}>
                        <div className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: colors[e.type] ?? '#64748b' }}/>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm" style={{ color: '#cbd5e1' }}>{e.label}</span>
                        </div>
                        <span className="text-xs font-mono shrink-0" style={{ color: '#64748b' }}>{e.sensorId}</span>
                        <span className="text-xs font-mono shrink-0" style={{ color: '#475569' }}>{e.time}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Stats rápidos */}
            <div className="mt-6 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {[
                { label: 'Sensores activos', value: sensors.filter(s => s.status !== 'offline').length, color: '#10b981' },
                { label: 'Activados',         value: sensors.filter(s => s.status === 'triggered').length, color: '#f43f5e' },
                { label: 'Eventos hoy',       value: events.filter(e => e.date === '2025-06-14').length, color: '#22d3ee' },
                { label: 'Alertas activas',   value: activeAlerts, color: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl p-4"
                  style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)' }}>
                  <p className="text-xs mb-1" style={{ color: '#64748b' }}>{stat.label}</p>
                  <p className="text-2xl font-medium font-mono" style={{ color: stat.color }}>
                    {loadSensors ? '—' : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALERTAS ── */}
        {tab === 'alertas' && (
          <div>
            <SectionTitle>Alertas activas</SectionTitle>
            {loadAlerts ? (
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 animate-pulse rounded-xl" style={{ background: '#1e293b' }}/>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm" style={{ color: '#334155' }}>Sin alertas registradas</p>
              </div>
            ) : (
              <div>
                {alerts.map(a => (
                  <AlertItem key={a.id} alert={a} onAck={acknowledge} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab === 'historial' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>Historial de eventos</SectionTitle>
              <span className="text-xs" style={{ color: '#334155' }}>
                Haz clic en una fila para ver el detalle
              </span>
            </div>
            <EventTable events={events} loading={loadEvents} />
          </div>
        )}

        {/* ── USUARIOS ── */}
        {tab === 'usuarios' && can('manage_users') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium tracking-widest"
                style={{ color: '#64748b', textTransform: 'uppercase' }}>
                Gestión de usuarios
              </p>
              <span className="text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee' }}>
                {MOCK_USERS.length} usuarios registrados
              </span>
            </div>
            <UserList />
          </div>
        )}

      </main>
    </div>
  )
}
