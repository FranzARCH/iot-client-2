import { useState } from 'react'
import type { SecurityEvent } from '../../types'
import EventModal from './EventModal'

const typeStyles: Record<string, { bg: string; color: string; label: string }> = {
  motion: { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', label: 'Movimiento' },
  door:   { bg: 'rgba(34,211,238,0.08)', color: '#22d3ee', label: 'Puerta'     },
  auth:   { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', label: 'Acceso'     },
  alert:  { bg: 'rgba(244,63,94,0.1)',   color: '#f43f5e', label: 'Alerta'     },
}

const severityDot: Record<string, string> = {
  ok: '#10b981', warning: '#f59e0b', critical: '#f43f5e',
}

function ThumbPlaceholder({ type }: { type: string }) {
  return (
    <div className="w-11 h-8 rounded flex items-center justify-center"
      style={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.12)' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={typeStyles[type]?.color ?? '#64748b'} strokeWidth="1.5" strokeLinecap="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    </div>
  )
}

interface Props { events: SecurityEvent[]; loading: boolean }

export default function EventTable({ events, loading }: Props) {
  const [selected, setSelected] = useState<SecurityEvent | null>(null)

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(148,163,184,0.12)' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="h-12 animate-pulse" style={{ background: i % 2 === 0 ? '#1e293b' : '#162032' }}/>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl overflow-auto" style={{ border: '1px solid rgba(148,163,184,0.12)' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
              {['Fecha / Hora', 'Sensor', 'Evento', 'Imagen', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium tracking-widest"
                  style={{ color: '#64748b', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => {
              const ts = typeStyles[e.type] ?? typeStyles.alert
              return (
                <tr
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="cursor-pointer transition-colors"
                  style={{
                    background: i % 2 === 0 ? '#1e293b' : '#162032',
                    borderBottom: '1px solid rgba(148,163,184,0.06)',
                  }}
                  onMouseEnter={el => { (el.currentTarget as HTMLElement).style.background = 'rgba(34,211,238,0.05)' }}
                  onMouseLeave={el => { (el.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#1e293b' : '#162032' }}
                >
                  <td className="px-4 py-3">
                    <div className="text-xs" style={{ color: '#94a3b8' }}>{e.date}</div>
                    <div className="text-xs font-mono" style={{ color: '#64748b' }}>{e.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: '#64748b' }}>{e.sensorId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: severityDot[e.severity] }}/>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: ts.bg, color: ts.color }}>
                        {ts.label}
                      </span>
                      <span className="text-xs hidden sm:block" style={{ color: '#94a3b8' }}>{e.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {e.imageUrl
                      ? <img src={e.imageUrl} alt="captura" className="w-11 h-8 object-cover rounded"/>
                      : <ThumbPlaceholder type={e.type}/>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs px-2.5 py-1 rounded cursor-pointer"
                      style={{ border: '1px solid rgba(148,163,184,0.15)', color: '#64748b', background: 'transparent' }}>
                      Ver
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {events.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: '#64748b' }}>
            Sin eventos registrados
          </div>
        )}
      </div>

      <EventModal event={selected} onClose={() => setSelected(null)}/>
    </>
  )
}
