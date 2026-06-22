import type { Sensor, SecurityEvent, Alert, AuthUser } from '../types'
import MOCK_USERS from './users.json'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_SENSORS: Sensor[] = [
  {
    id: 'PIR-01', name: 'Sensor PIR', location: 'Zona A – Pasillo norte',
    type: 'pir', status: 'online', lastValue: '0 mov', lastSeen: '2025-06-14T09:47:22',
  },
  {
    id: 'MAG-01', name: 'Sensor Magnético', location: 'Puerta principal',
    type: 'magnetic', status: 'online', lastValue: 'CERRADA', lastSeen: '2025-06-14T09:45:10',
  },
  {
    id: 'PIR-02', name: 'Sensor PIR', location: 'Zona B – Sala de servidores',
    type: 'pir', status: 'triggered', lastValue: '1 mov', lastSeen: '2025-06-14T09:30:58',
  },
  {
    id: 'CAM-01', name: 'ESP32-CAM', location: 'Entrada norte',
    type: 'camera', status: 'online', lastValue: '1080p', lastSeen: '2025-06-14T09:47:00',
  },
  {
    id: 'MAG-02', name: 'Sensor Magnético', location: 'Puerta trasera',
    type: 'magnetic', status: 'offline', lastValue: 'N/A', lastSeen: '2025-06-14T07:00:00',
  },
]

const MOCK_EVENTS: SecurityEvent[] = [
  { id: 'EVT-001', date: '2025-06-14', time: '09:47:22', sensorId: 'PIR-01', type: 'motion', label: 'Movimiento detectado',           severity: 'warning',  imageUrl: null },
  { id: 'EVT-002', date: '2025-06-14', time: '09:45:10', sensorId: 'MAG-01', type: 'door',   label: 'Apertura de puerta',             severity: 'ok',       imageUrl: null },
  { id: 'EVT-003', date: '2025-06-14', time: '09:30:58', sensorId: 'PIR-02', type: 'alert',  label: 'INTRUSIÓN detectada – Zona B',   severity: 'critical', imageUrl: null },
  { id: 'EVT-004', date: '2025-06-14', time: '08:55:04', sensorId: 'CAM-01', type: 'auth',   label: 'Acceso autorizado',              severity: 'ok',       imageUrl: null },
  { id: 'EVT-005', date: '2025-06-14', time: '08:12:33', sensorId: 'MAG-01', type: 'door',   label: 'Apertura de puerta',             severity: 'ok',       imageUrl: null },
  { id: 'EVT-006', date: '2025-06-13', time: '23:44:18', sensorId: 'PIR-01', type: 'alert',  label: 'ALERTA: movimiento nocturno',    severity: 'critical', imageUrl: null },
  { id: 'EVT-007', date: '2025-06-13', time: '22:10:02', sensorId: 'PIR-02', type: 'motion', label: 'Movimiento detectado',           severity: 'warning',  imageUrl: null },
  { id: 'EVT-008', date: '2025-06-13', time: '18:30:11', sensorId: 'CAM-01', type: 'auth',   label: 'Acceso autorizado',              severity: 'ok',       imageUrl: null },
  { id: 'EVT-009', date: '2025-06-13', time: '12:05:44', sensorId: 'MAG-02', type: 'door',   label: 'Apertura de puerta trasera',     severity: 'warning',  imageUrl: null },
  { id: 'EVT-010', date: '2025-06-12', time: '09:00:00', sensorId: 'PIR-01', type: 'motion', label: 'Movimiento detectado',           severity: 'warning',  imageUrl: null },
]

const MOCK_ALERTS: Alert[] = [
  { id: 'ALT-001', level: 'critical', message: 'INTRUSIÓN detectada en Zona B (PIR-02)',          sensorId: 'PIR-02', timestamp: '2025-06-14T09:30:58', acknowledged: false },
  { id: 'ALT-002', level: 'critical', message: 'Movimiento nocturno fuera de horario (PIR-01)',   sensorId: 'PIR-01', timestamp: '2025-06-13T23:44:18', acknowledged: false },
  { id: 'ALT-003', level: 'warning',  message: 'Apertura de puerta sin autenticación (MAG-01)',   sensorId: 'MAG-01', timestamp: '2025-06-14T09:45:10', acknowledged: false },
  { id: 'ALT-004', level: 'warning',  message: 'Sensor MAG-02 sin conexión desde hace 2 h',       sensorId: 'MAG-02', timestamp: '2025-06-14T07:00:00', acknowledged: true  },
]

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthUser> {
  await delay(600)
  if (!email || !password) throw new Error('Completa todos los campos')

  // Busca el usuario en el JSON local (simula consulta al backend)
  const user = MOCK_USERS.find(
    u => u.email === email && u.password === password
  )
  if (!user)   throw new Error('Email o contraseña incorrectos')
  if (!user.active) throw new Error('Cuenta desactivada. Contacta al administrador.')

  // Guarda sesión en localStorage (simula JWT)
  const session = { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, token: `mock-jwt-${user.id}` }
  localStorage.setItem('sentinel_session', JSON.stringify(session))

  // Supabase: return supabase.auth.signInWithPassword({ email, password })
  return session
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem('sentinel_session')
  return raw ? JSON.parse(raw) : null
}

export async function logout(): Promise<void> {
  await delay(200)
  localStorage.removeItem('sentinel_session')
  // Supabase: return supabase.auth.signOut()
}

// ─── SENSORS ──────────────────────────────────────────────────────────────────

export async function getSensors(): Promise<Sensor[]> {
  await delay(300)
  return MOCK_SENSORS
  // Supabase: const { data } = await supabase.from('sensors').select('*')
  // return data ?? []
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────

export async function getEvents(limit = 50): Promise<SecurityEvent[]> {
  await delay(400)
  return MOCK_EVENTS.slice(0, limit)
  // Supabase: const { data } = await supabase
  //   .from('events').select('*').order('date', { ascending: false }).limit(limit)
  // return data ?? []
}

// ─── ALERTS ───────────────────────────────────────────────────────────────────

export async function getAlerts(): Promise<Alert[]> {
  await delay(250)
  return MOCK_ALERTS
  // Supabase: const { data } = await supabase.from('alerts').select('*').order('timestamp', { ascending: false })
  // return data ?? []
}

export async function acknowledgeAlert(id: string): Promise<void> {
  await delay(300)
  const alert = MOCK_ALERTS.find(a => a.id === id)
  if (alert) alert.acknowledged = true
  // Supabase: await supabase.from('alerts').update({ acknowledged: true }).eq('id', id)
}

// ─── REAL-TIME (descomentar al integrar Supabase) ─────────────────────────────
// export function subscribeToSensors(cb: (sensor: Sensor) => void) {
//   return supabase.channel('sensors-realtime')
//     .on('postgres_changes', { event: '*', schema: 'public', table: 'sensors' },
//       payload => cb(payload.new as Sensor))
//     .subscribe()
// }
//
// export function subscribeToEvents(cb: (event: SecurityEvent) => void) {
//   return supabase.channel('events-realtime')
//     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' },
//       payload => cb(payload.new as SecurityEvent))
//     .subscribe()
// }
