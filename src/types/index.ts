export type SensorType     = 'pir' | 'magnetic' | 'camera'
export type SensorStatus   = 'online' | 'offline' | 'triggered'
export type EventType      = 'motion' | 'door' | 'auth' | 'alert'
export type EventSeverity  = 'ok' | 'warning' | 'critical'
export type AlertLevel     = 'critical' | 'warning'

export interface Sensor {
  id:        string
  name:      string
  location:  string
  type:      SensorType
  status:    SensorStatus
  lastValue: string
  lastSeen:  string
}

export interface SecurityEvent {
  id:        string
  date:      string
  time:      string
  sensorId:  string
  type:      EventType
  label:     string
  severity:  EventSeverity
  imageUrl:  string | null
}

export interface Alert {
  id:             string
  level:          AlertLevel
  message:        string
  sensorId:       string
  timestamp:      string
  acknowledged:   boolean
}

export interface AuthUser {
  id?:    string
  email:  string
  name:   string
  role:   string
  avatar: string
  token:  string
}
