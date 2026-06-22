import { useState, FormEvent, useCallback} from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/services'
import FaceCapture from '../components/camera/FaceCapture'
import MOCK_USERS from '../api/users.json'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }
  const handleFaceRecognized = useCallback((recognizedName: string) => {
  // Busca el usuario en el JSON por nombre
    const found = MOCK_USERS.find(u => u.name === recognizedName && u.active)

    const session = found
      ? {
          id:     found.id,
          email:  found.email,
          name:   found.name,
          role:   found.role,
          avatar: found.avatar,
          token:  `face-jwt-${found.id}`,
        }
      : {
          id:     'face-unknown',
          email:  'facial@sentinel.io',
          name:   recognizedName,
          role:   'viewer',
          avatar: recognizedName.slice(0, 2).toUpperCase(),
          token:  `face-jwt-${Date.now()}`,
        }

    localStorage.setItem('sentinel_session', JSON.stringify(session))
    navigate('/dashboard')
  }, [navigate])
  return (
    <div
      className="min-h-screen flex items-center justify-center flex-wrap gap-6 p-6"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.05) 0%, transparent 60%), #0a0f1e',
      }}
    >
      {/* Formulario de login */}
      <form onSubmit={handleSubmit} className="w-full" style={{ maxWidth: 360 }}>
        <div className="rounded-2xl p-8" style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.12)' }}>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none"
              stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 3 L19 7 L19 11 C19 15.4 15.4 19.3 11 21 C6.6 19.3 3 15.4 3 11 L3 7 Z"/>
              <circle cx="11" cy="11" r="2.5"/>
              <path d="M11 8.5L11 3.5M11 13.5L11 18.5M13.5 11L18.5 11M8.5 11L3.5 11"/>
            </svg>
            <span className="text-sm font-medium tracking-widest" style={{ color: '#22d3ee' }}>
              SENTINEL IoT
            </span>
          </div>

          <h1 className="text-lg font-medium mb-1" style={{ color: '#22d3ee' }}>
            Acceso al sistema
          </h1>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            Autenticación de dos factores requerida
          </p>

          {/* Usuario */}
          <div className="mb-4">
            <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Usuario</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@sentinel.io"
              className="w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                background: '#0f172a', color: '#e2e8f0',
                border: '1px solid rgba(148,163,184,0.15)',
              }}
              onFocus={e => { e.target.style.borderColor = '#0e7490' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(148,163,184,0.15)' }}
            />
          </div>

          {/* Contraseña */}
          <div className="mb-5">
            <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                background: '#0f172a', color: '#e2e8f0',
                border: '1px solid rgba(148,163,184,0.15)',
              }}
              onFocus={e => { e.target.style.borderColor = '#0e7490' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(148,163,184,0.15)' }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs mb-3 px-3 py-2 rounded-lg"
              style={{ color: '#f43f5e', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
              {error}
            </p>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            style={{
              background: loading ? '#0c3d4a' : '#0e7490',
              color: '#22d3ee',
              border: '1px solid #0e7490',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Verificando...' : 'Ingresar al sistema'}
          </button>

          <p className="text-center text-xs mt-4" style={{ color: '#334155' }}>
            Mock: ingresa cualquier email y contraseña
          </p>
        </div>
      </form>

      {/* Módulo de cámara */}
      <FaceCapture onRecognized={handleFaceRecognized} />
    </div>
  )
}
