import type { Alert } from '../../types'
import { usePermissions } from '../../hooks/usePermissions'

interface Props {
  alert:      Alert
  onAck:      (id: string) => void
}

export default function AlertItem({ alert, onAck }: Props) {
  const isCritical = alert.level === 'critical'
  const { can } = usePermissions()
  const date = new Date(alert.timestamp)
  const formatted = date.toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className="flex items-start gap-3 rounded-xl p-4 mb-2"
      style={{
        background: '#1e293b',
        border: `1px solid ${isCritical ? 'rgba(244,63,94,0.35)' : 'rgba(245,158,11,0.3)'}`,
        borderLeft: `3px solid ${isCritical ? '#f43f5e' : '#f59e0b'}`,
        opacity: alert.acknowledged ? 0.55 : 1,
      }}
    >
      {/* Icono */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
        style={{
          background: isCritical ? 'rgba(244,63,94,0.12)' : 'rgba(245,158,11,0.12)',
          color:      isCritical ? '#f43f5e' : '#f59e0b',
        }}>
        {isCritical ? '⚠' : '◉'}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: '#cbd5e1' }}>{alert.message}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs" style={{ color: '#64748b' }}>{formatted}</span>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{
              background: isCritical ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
              color:      isCritical ? '#f43f5e' : '#f59e0b',
            }}>
            {alert.sensorId}
          </span>
          {alert.acknowledged && (
            <span className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              Revisado
            </span>
          )}
        </div>
      </div>

      {/* Botón reconocer */}
      {!alert.acknowledged && can('manage_alerts') && (
        <button
          onClick={() => onAck(alert.id)}
          className="text-xs px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition-colors"
          style={{ border: '1px solid rgba(148,163,184,0.2)', color: '#64748b', background: 'transparent' }}
          onMouseEnter={e => { (e.currentTarget).style.color = '#22d3ee'; (e.currentTarget).style.borderColor = 'rgba(34,211,238,0.4)' }}
          onMouseLeave={e => { (e.currentTarget).style.color = '#64748b'; (e.currentTarget).style.borderColor = 'rgba(148,163,184,0.2)' }}
        >
          Reconocer
        </button>
      )}
    </div>
  )
}
