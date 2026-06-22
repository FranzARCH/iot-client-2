import { useEffect } from 'react'
import type { SecurityEvent } from '../../types'

const typeLabel: Record<string, string> = {
  motion: 'Movimiento', door: 'Puerta', auth: 'Acceso', alert: 'Alerta',
}
const severityLabel: Record<string, string> = {
  ok: 'Normal', warning: 'Advertencia', critical: 'Crítico',
}
const severityColor: Record<string, string> = {
  ok: '#10b981', warning: '#f59e0b', critical: '#f43f5e',
}

interface Props {
  event:   SecurityEvent | null
  onClose: () => void
}

export default function EventModal({ event, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!event) return null

  const rows = [
    ['ID evento',  event.id],
    ['Fecha',      event.date],
    ['Hora',       event.time],
    ['Sensor',     event.sensorId],
    ['Tipo',       typeLabel[event.type] ?? event.type],
    ['Severidad',  severityLabel[event.severity] ?? event.severity],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)' }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-medium" style={{ color: '#e2e8f0' }}>{event.label}</h2>
          <button onClick={onClose}
            className="text-lg leading-none cursor-pointer"
            style={{ color: '#64748b' }}>✕</button>
        </div>

        {/* Imagen capturada */}
        <div className="w-full rounded-xl mb-4 flex flex-col items-center justify-center gap-2"
          style={{
            aspectRatio: '4/3',
            background: '#050a14',
            border: '1px solid rgba(148,163,184,0.12)',
          }}>
          {event.imageUrl ? (
            <img src={event.imageUrl} alt="Captura del evento"
              className="w-full h-full object-cover rounded-xl"/>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={severityColor[event.severity]} strokeWidth="1.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-xs font-mono" style={{ color: '#0e7490' }}>
                {event.id}.jpg · ESP32-CAM
              </span>
              <span className="text-xs" style={{ color: '#334155' }}>
                (Conecta Supabase Storage para ver la imagen)
              </span>
            </>
          )}
        </div>

        {/* Detalles */}
        <div>
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between py-2"
              style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
              <span className="text-sm" style={{ color: '#64748b' }}>{k}</span>
              <span className="text-sm font-mono" style={{
                color: k === 'Severidad' ? severityColor[event.severity] : '#cbd5e1',
              }}>{v}</span>
            </div>
          ))}
        </div>

        <button onClick={onClose}
          className="w-full mt-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
          style={{ border: '1px solid rgba(148,163,184,0.15)', color: '#94a3b8', background: 'transparent' }}
          onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(34,211,238,0.4)'; (e.currentTarget).style.color = '#22d3ee' }}
          onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(148,163,184,0.15)'; (e.currentTarget).style.color = '#94a3b8' }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
