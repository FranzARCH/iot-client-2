import type { Sensor } from '../../types'

const statusColors = {
  online:    { dot: '#10b981', border: 'rgba(34,211,238,0.25)',  bg: 'rgba(34,211,238,0.04)'  },
  offline:   { dot: '#64748b', border: 'rgba(148,163,184,0.12)', bg: 'transparent'             },
  triggered: { dot: '#f43f5e', border: 'rgba(244,63,94,0.5)',    bg: 'rgba(244,63,94,0.06)'   },
}

const statusLabel = {
  online:    'En línea',
  offline:   'Sin conexión',
  triggered: '¡ACTIVADO!',
}

const typeIcon = (type: Sensor['type']) => {
  if (type === 'pir') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 3 C12 3 5 8 5 14 A7 7 0 0 0 19 14 C19 8 12 3 12 3Z"/>
      <line x1="12" y1="14" x2="12" y2="17"/>
    </svg>
  )
  if (type === 'magnetic') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="3" width="8" height="18" rx="2"/>
      <rect x="13" y="3" width="8" height="18" rx="2"/>
      <path d="M7 21 C7 18 17 18 17 21"/>
    </svg>
  )
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

interface Props { sensor: Sensor }

export default function SensorCard({ sensor }: Props) {
  const colors = statusColors[sensor.status]

  return (
    <div
      className={`rounded-xl p-4 flex flex-col gap-3 ${sensor.status === 'triggered' ? 'animate-alert-card' : ''}`}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: '#64748b' }}>{sensor.id}</span>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors.dot,
          boxShadow: sensor.status === 'triggered' ? `0 0 6px ${colors.dot}` : 'none' }}/>
      </div>

      <div className="flex items-center gap-2" style={{ color: sensor.status === 'triggered' ? '#f43f5e' : '#94a3b8' }}>
        {typeIcon(sensor.type)}
        <span className="text-sm font-medium" style={{ color: '#cbd5e1' }}>{sensor.name}</span>
      </div>

      <div className="text-2xl font-medium font-mono" style={{ color: '#22d3ee' }}>
        {sensor.lastValue}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: '#64748b' }}>{sensor.location}</span>
        <span className="text-xs px-2 py-0.5 rounded"
          style={{
            background: sensor.status === 'triggered' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
            color:      sensor.status === 'triggered' ? '#f43f5e' : sensor.status === 'offline' ? '#64748b' : '#10b981',
          }}>
          {statusLabel[sensor.status]}
        </span>
      </div>
    </div>
  )
}
