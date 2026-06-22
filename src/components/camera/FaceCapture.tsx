import { useEffect, useRef, useState, useCallback } from 'react'
import * as faceapi from 'face-api.js'

// ─── Usuarios conocidos ───────────────────────────────────────────────────────
// Agrega aquí cada usuario con la ruta a su foto de referencia en /public/known-faces/
const KNOWN_USERS = [
  { name: 'Administrador',  image: '/known-faces/admin.jpg'          },
 // { name: 'Carlos Mendoza', image: '/known-faces/carlos-mendoza.jpg' },
 // { name: 'Sofía Torres',   image: '/known-faces/sofia-torres.jpg'   },
]

type LoadState    = 'idle' | 'loading-models' | 'loading-faces' | 'ready' | 'error'
type DetectState  = 'waiting' | 'detected' | 'recognized' | 'unknown'

interface RecognizedUser {
  name:     string
  distance: number
}

interface Props {
  onRecognized?: (name: string) => void
}

export default function FaceCapture({ onRecognized }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasNavigatedRef = useRef(false)

  const [loadState,   setLoadState]   = useState<LoadState>('idle')
  const [detectState, setDetectState] = useState<DetectState>('waiting')
  const [recognized,  setRecognized]  = useState<RecognizedUser | null>(null)
  const [errorMsg,    setErrorMsg]    = useState('')
  const [modelsReady, setModelsReady] = useState(false)

  const labeledDescriptorsRef = useRef<faceapi.LabeledFaceDescriptors[]>([])

  // ── 1. Cargar modelos de IA ──────────────────────────────────────────────
  useEffect(() => {
    const loadModels = async () => {
      setLoadState('loading-models')
      try {
        const MODEL_URL = '/models'
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        setModelsReady(true)
        setLoadState('loading-faces')
        await loadKnownFaces()
        setLoadState('ready')
      } catch (e) {
        console.error('Error cargando modelos:', e)
        setErrorMsg('No se pudieron cargar los modelos. Verifica que public/models/ existe con los archivos descargados.')
        setLoadState('error')
      }
    }
    loadModels()
  }, [])

  // ── 2. Calcular descriptores de usuarios conocidos ───────────────────────
  const loadKnownFaces = async () => {
    const labeled: faceapi.LabeledFaceDescriptors[] = []

    for (const user of KNOWN_USERS) {
      try {
        const img = await faceapi.fetchImage(user.image)
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor()

        if (detection) {
          labeled.push(new faceapi.LabeledFaceDescriptors(user.name, [detection.descriptor]))
          console.log(`Rostro cargado: ${user.name}`)
        } else {
          console.warn(`Sin rostro en imagen: ${user.image}`)
        }
      } catch {
        console.warn(`No se pudo cargar: ${user.image}`)
      }
    }

    labeledDescriptorsRef.current = labeled
  }

  // ── 3. Activar cámara ────────────────────────────────────────────────────
  useEffect(() => {
    if (loadState !== 'ready') return
    let stream: MediaStream | null = null

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      .then(s => {
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => {
        setErrorMsg('No se pudo acceder a la cámara.')
        setLoadState('error')
      })

    return () => {
      stream?.getTracks().forEach(t => t.stop())
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loadState])

  // ── 4. Detección continua ────────────────────────────────────────────────
  const startDetection = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(async () => {
      const video  = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || !modelsReady) return
      if (video.readyState < 2) return

      const displaySize = { width: video.videoWidth, height: video.videoHeight }
      faceapi.matchDimensions(canvas, displaySize)

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors()

      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)

      const resized = faceapi.resizeResults(detections, displaySize)

      if (resized.length === 0) {
        setDetectState('waiting')
        setRecognized(null)
        return
      }

      setDetectState('detected')

      if (labeledDescriptorsRef.current.length > 0) {
        const matcher = new faceapi.FaceMatcher(labeledDescriptorsRef.current, 0.6)

        for (const detection of resized) {
          const match = matcher.findBestMatch(detection.descriptor)
          const box   = detection.detection.box
          const color = match.label !== 'unknown' ? '#22d3ee' : '#f43f5e'

          if (ctx) {
            ctx.strokeStyle = color
            ctx.lineWidth   = 2
            ctx.strokeRect(box.x, box.y, box.width, box.height)
            ctx.fillStyle = color
            ctx.fillRect(box.x, box.y - 22, box.width, 22)
            ctx.fillStyle = '#0a0f1e'
            ctx.font      = '13px monospace'
            ctx.fillText(
              match.label !== 'unknown'
                ? `${match.label} (${Math.round((1 - match.distance) * 100)}%)`
                : 'Desconocido',
              box.x + 4,
              box.y - 6
            )
          }

          if (match.label !== 'unknown') {
            setDetectState('recognized')
            setRecognized({ name: match.label, distance: match.distance })
            if (!hasNavigatedRef.current) { 
              hasNavigatedRef.current = true
              onRecognized?.(match.label)
            }
          } else {
            setDetectState('unknown')
            setRecognized(null)
          }
        }
      } else {
        for (const detection of resized) {
          const box = detection.detection.box
          if (ctx) {
            ctx.strokeStyle = '#22d3ee'
            ctx.lineWidth   = 2
            ctx.strokeRect(box.x, box.y, box.width, box.height)
          }
          setDetectState('detected')
        }
      }
    }, 300)
  }, [modelsReady, onRecognized])

  const handleVideoPlay = () => { startDetection() }

  // ── UI ───────────────────────────────────────────────────────────────────
  const statusColor = {
    waiting:    '#64748b',
    detected:   '#f59e0b',
    recognized: '#10b981',
    unknown:    '#f43f5e',
  }[detectState]

  const statusText = {
    waiting:    'Buscando rostro...',
    detected:   'Rostro detectado — analizando...',
    recognized: `Identificado: ${recognized?.name ?? ''}`,
    unknown:    'Rostro no reconocido',
  }[detectState]

  return (
    <div className="rounded-2xl p-5 w-full"
      style={{ maxWidth: 360, background: '#1e293b', border: '1px solid rgba(148,163,184,0.12)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: '#64748b' }}>
        <span className="w-1.5 h-1.5 rounded-full"
          style={{ background: loadState === 'ready' ? statusColor : '#f59e0b', animation: 'pulse-dot 2s infinite' }}/>
        Verificación facial en tiempo real
      </div>

      {/* Marco */}
      <div className="relative w-full rounded-xl overflow-hidden"
        style={{ aspectRatio: '4/3', background: '#050a14', border: '1px solid rgba(148,163,184,0.1)' }}>

        <video ref={videoRef} autoPlay muted playsInline onPlay={handleVideoPlay}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: loadState === 'ready' ? 'block' : 'none' }}/>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
          style={{ display: loadState === 'ready' ? 'block' : 'none' }}/>

        {/* Cargando */}
        {loadState !== 'ready' && loadState !== 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }}/>
            <span className="text-xs text-center px-4" style={{ color: '#64748b' }}>
              {loadState === 'loading-models' ? 'Cargando modelos de IA...' : 'Cargando rostros conocidos...'}
            </span>
          </div>
        )}

        {/* Error */}
        {loadState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-xs" style={{ color: '#f43f5e' }}>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Estado */}
      {loadState === 'ready' && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: statusColor }}/>
          <span className="text-xs" style={{ color: statusColor }}>{statusText}</span>
          {detectState === 'recognized' && recognized && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded font-mono"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              {Math.round((1 - recognized.distance) * 100)}% coincidencia
            </span>
          )}
        </div>
      )}

      {/* Barra de progreso */}
      {(loadState === 'loading-models' || loadState === 'loading-faces') && (
        <div className="mt-3">
          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: '#0f172a' }}>
            <div className="h-full rounded-full"
              style={{ background: '#22d3ee', width: loadState === 'loading-models' ? '40%' : '80%', transition: 'width 0.5s' }}/>
          </div>
        </div>
      )}
    </div>
  )
}
