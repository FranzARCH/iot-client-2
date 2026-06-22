import type { Sensor } from '../../types'
import SensorCard from './SensorCard'

interface Props { sensors: Sensor[]; loading: boolean }

export default function SensorGrid({ sensors, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-xl p-4 h-36 animate-pulse"
            style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.12)' }}/>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
      {sensors.map(s => <SensorCard key={s.id} sensor={s} />)}
    </div>
  )
}
