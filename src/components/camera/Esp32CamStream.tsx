import { useMemo, useState } from 'react'

const STREAM_KEY = 'esp32cam_stream_url'
const SNAPSHOT_KEY = 'esp32cam_snapshot_url'

const DEFAULT_STREAM_URL = '/esp32cam-stream'
const DEFAULT_SNAPSHOT_URL = '/esp32cam-capture'

function readStored(key: string, fallback: string) {
  const value = localStorage.getItem(key)
  return value && value.trim() ? value : fallback
}

function withCacheBuster(url: string, seed: number) {
  if (!url.trim()) return ''
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${seed}`
}

export default function Esp32CamStream() {
  const [streamUrl, setStreamUrl] = useState<string>(() => readStored(STREAM_KEY, DEFAULT_STREAM_URL))
  const [snapshotUrl, setSnapshotUrl] = useState<string>(() => readStored(SNAPSHOT_KEY, DEFAULT_SNAPSHOT_URL))
  const [streamInput, setStreamInput] = useState(streamUrl)
  const [snapshotInput, setSnapshotInput] = useState(snapshotUrl)
  const [refreshSeed, setRefreshSeed] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const imageSrc = useMemo(
    () => withCacheBuster(streamUrl, refreshSeed),
    [streamUrl, refreshSeed]
  )

  const statusColor = isConnected ? '#10b981' : '#f59e0b'
  const statusText = isConnected ? 'Conectado' : 'Esperando stream...'

  const saveUrls = () => {
    const nextStream = streamInput.trim()
    const nextSnapshot = snapshotInput.trim()

    if (!nextStream) {
      setErrorMsg('Ingresa la URL del stream del ESP32-CAM.')
      return
    }

    setStreamUrl(nextStream)
    setSnapshotUrl(nextSnapshot)
    setRefreshSeed(prev => prev + 1)
    setIsConnected(false)
    setErrorMsg('')

    localStorage.setItem(STREAM_KEY, nextStream)
    if (nextSnapshot) localStorage.setItem(SNAPSHOT_KEY, nextSnapshot)
  }

  const refreshStream = () => {
    setRefreshSeed(prev => prev + 1)
    setIsConnected(false)
    setErrorMsg('')
  }

  return (
    <section className="rounded-2xl p-4 md:p-5"
      style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.12)' }}>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <p className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
          Vista en vivo · ESP32-CAM
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
          <span style={{ color: statusColor }}>{statusText}</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl mb-3"
        style={{ aspectRatio: '16/9', background: '#050a14', border: '1px solid rgba(148,163,184,0.1)' }}>
        {imageSrc && (
          <img
            key={imageSrc}
            src={imageSrc}
            alt="Stream de camara ESP32"
            className="w-full h-full object-cover"
            onLoad={() => {
              setIsConnected(true)
              setErrorMsg('')
            }}
            onError={() => {
              setIsConnected(false)
              setErrorMsg('No se pudo abrir el stream. Verifica que la camara este conectada al WiFi y que su IP coincida con VITE_ESP32CAM_HOST.')
            }}
          />
        )}

        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="text-xs" style={{ color: '#64748b' }}>
              Esperando video MJPEG en {streamUrl}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-2 md:grid-cols-2 mb-3">
        <label className="text-xs" style={{ color: '#64748b' }}>
          URL stream
          <input
            value={streamInput}
            onChange={e => setStreamInput(e.target.value)}
            placeholder="http://IP-ESP32:81/stream"
            className="mt-1 w-full rounded-md px-2 py-2 text-sm"
            style={{
              background: '#0f172a',
              color: '#cbd5e1',
              border: '1px solid rgba(148,163,184,0.2)',
            }}
          />
        </label>

        <label className="text-xs" style={{ color: '#64748b' }}>
          URL captura (opcional)
          <input
            value={snapshotInput}
            onChange={e => setSnapshotInput(e.target.value)}
            placeholder="http://IP-ESP32/capture"
            className="mt-1 w-full rounded-md px-2 py-2 text-sm"
            style={{
              background: '#0f172a',
              color: '#cbd5e1',
              border: '1px solid rgba(148,163,184,0.2)',
            }}
          />
        </label>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={saveUrls}
          className="text-xs px-3 py-2 rounded-md cursor-pointer"
          style={{ background: '#0e7490', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}>
          Guardar URL
        </button>

        <button
          onClick={refreshStream}
          className="text-xs px-3 py-2 rounded-md cursor-pointer"
          style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' }}>
          Reconectar
        </button>

        {snapshotUrl && (
          <a
            href={withCacheBuster(snapshotUrl, refreshSeed)}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3 py-2 rounded-md"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
            Abrir captura
          </a>
        )}
      </div>

      {errorMsg && (
        <p className="mt-3 text-xs" style={{ color: '#f43f5e' }}>{errorMsg}</p>
      )}

      <p className="mt-3 text-xs" style={{ color: '#64748b' }}>
        En local con npm run dev se usa proxy: /esp32cam-stream y /esp32cam-capture. Si publicas fuera de tu red local, necesitas IP publica, VPN o un backend relay.
      </p>
    </section>
  )
}
