import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Tone = 'light' | 'dark' | 'mid' | 'orange'

interface Honeycomb {
  x: number
  y: number
  radius: number
  rotation: number
  spin: number
  alpha: number
  decay: number
  vx: number
  vy: number
  tone: Tone
  shrink: number
  burst: boolean
  core: boolean
  originX: number
  originY: number
  born?: number
  life?: number
  startX?: number
  startY?: number
  baseAlpha?: number
  baseRadius?: number
}

interface TapDetail {
  x: number
  y: number
  interactive: boolean
}

interface PressTrack {
  id: number
  x: number
  y: number
  time: number
  pointerType: string
  interactive: boolean
  moved: boolean
}

declare global {
  interface Window {
    userWantsSilence?: boolean
  }
}

const TAU = Math.PI * 2
const MAX_HONEYCOMBS = 170
const LINK_DISTANCE = 88
const SOUND_STORAGE_KEY = 'pk-click-sound'
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], [data-cursor], .reel-card, .reel-strip'
const ORANGE = '#FF5722'
const ORANGE_HOT = '#FF7A1A'

function isSaturatedOrange(r: number, g: number, b: number) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  // Saturated orange foregrounds (text/lines) also deserve the white treatment.
  return max > 0 && (max - min) / max > 0.45 && r > 130 && r > g * 1.35 && r > b * 1.8 && luminance < 0.7
}

function accentFor(tone: Tone) {
  if (tone === 'orange') return '#FFFFFF'
  return tone === 'dark' ? ORANGE_HOT : ORANGE
}

function toneAt(x: number, y: number): Tone {
  let node = document.elementFromPoint(x, y) as HTMLElement | null
  let depth = 0
  while (node && depth < 12) {
    const style = getComputedStyle(node)
    const match = style.backgroundColor.match(
      /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/,
    )
    if (match) {
      const alpha = match[4] === undefined ? 1 : Number(match[4])
      if (alpha >= 0.4) {
        const r = Number(match[1])
        const g = Number(match[2])
        const b = Number(match[3])
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

        // Saturated orange surfaces get pure white particles for contrast.
        if (isSaturatedOrange(r, g, b)) return 'orange'

        if (luminance > 0.68) return 'light'
        if (luminance < 0.24) return 'dark'
        return 'mid'
      }
    }
    const colorMatch = style.color.match(
      /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/,
    )
    if (colorMatch) {
      const alpha = colorMatch[4] === undefined ? 1 : Number(colorMatch[4])
      if (alpha >= 0.4 && isSaturatedOrange(Number(colorMatch[1]), Number(colorMatch[2]), Number(colorMatch[3]))) {
        // Orange words under the cursor -> white impact particles.
        return 'orange'
      }
    }
    node = node.parentElement
    depth += 1
  }
  return 'light'
}

function traceHex(context: CanvasRenderingContext2D, radius: number) {
  context.beginPath()
  for (let side = 0; side < 6; side += 1) {
    const angle = (Math.PI / 3) * side
    const px = Math.cos(angle) * radius
    const py = Math.sin(angle) * radius
    if (side === 0) context.moveTo(px, py)
    else context.lineTo(px, py)
  }
  context.closePath()
}

function isScrollbarInteraction(event: PointerEvent) {
  let node: HTMLElement | null = event.target instanceof Element ? (event.target as HTMLElement) : null
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node)
    const scrollsY = /(auto|scroll|overlay)/.test(style.overflowY) && node.scrollHeight > node.clientHeight
    const scrollsX = /(auto|scroll|overlay)/.test(style.overflowX) && node.scrollWidth > node.clientWidth
    if (scrollsX || scrollsY) {
      const rect = node.getBoundingClientRect()
      const gutterX = node.offsetWidth - node.clientWidth
      const gutterY = node.offsetHeight - node.clientHeight
      if (scrollsY && gutterX > 0 && event.clientX >= rect.right - gutterX) return true
      if (scrollsX && gutterY > 0 && event.clientY >= rect.bottom - gutterY) return true
    }
    node = node.parentElement
  }

  const documentElement = document.documentElement
  if (documentElement.scrollHeight > documentElement.clientHeight && event.clientX >= documentElement.clientWidth) return true
  if (documentElement.scrollWidth > documentElement.clientWidth && event.clientY >= documentElement.clientHeight) return true
  return false
}

export default function HoneycombTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewSoundRef = useRef<(() => void) | null>(null)
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return false
    if (window.userWantsSilence === true) return true
    try {
      return window.localStorage.getItem(SOUND_STORAGE_KEY) === 'muted'
    } catch {
      return false
    }
  })
  const mutedRef = useRef(muted)

  useEffect(() => {
    mutedRef.current = muted
    window.userWantsSilence = muted
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, muted ? 'muted' : 'on')
    } catch {
      // Storage can be unavailable in private modes; the toggle still works for the session.
    }
  }, [muted])

  // Click synthesis and filtering stay independent from the visual effect so touch
  // devices still get audio while the canvas splash remains desktop-only.
  useEffect(() => {
    let audioContext: AudioContext | null = null
    let activeVoices = 0
    let track: PressTrack | null = null

    const ensureContext = () => {
      if (audioContext && audioContext.state !== 'closed') return audioContext
      try {
        const AudioConstructor =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!AudioConstructor) return null
        audioContext = new AudioConstructor()
      } catch {
        return null
      }
      return audioContext
    }

    const playClick = (interactive: boolean) => {
      if (mutedRef.current || window.userWantsSilence) return
      if (activeVoices >= 14) return

      const context = ensureContext()
      if (!context) return

      const schedule = () => {
        if (context.state !== 'running') return
        try {
          const start = context.currentTime + 0.002
          const mainStart = (interactive ? 1820 : 1480) * (1 + (Math.random() - 0.5) * 0.07)
          const mainEnd = (interactive ? 1180 : 980) * (1 + (Math.random() - 0.5) * 0.07)
          const subStart = (interactive ? 780 : 680) * (1 + (Math.random() - 0.5) * 0.06)
          const subEnd = 320 + Math.random() * 60
          const mainPeak = interactive ? 0.058 : 0.043
          const subPeak = interactive ? 0.026 : 0.021

          const voices: Array<[OscillatorType, number, number, number, number]> = [
            ['triangle', mainStart, mainEnd, mainPeak, 0.052],
            ['sine', subStart, subEnd, subPeak, 0.06],
          ]

          for (const [type, from, to, peak, duration] of voices) {
            const oscillator = context.createOscillator()
            const gain = context.createGain()
            oscillator.type = type
            oscillator.frequency.setValueAtTime(Math.max(from, 80), start)
            oscillator.frequency.linearRampToValueAtTime(Math.max(to, 60), start + 0.038)
            gain.gain.setValueAtTime(0.0001, start)
            gain.gain.linearRampToValueAtTime(peak, start + 0.004)
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
            oscillator.connect(gain)
            gain.connect(context.destination)
            oscillator.start(start)
            oscillator.stop(start + duration + 0.015)
            activeVoices += 1
            oscillator.onended = () => {
              activeVoices = Math.max(0, activeVoices - 1)
              try {
                oscillator.disconnect()
                gain.disconnect()
              } catch {
                // Nodes may already be garbage-collected when the tab closes.
              }
            }
          }
        } catch {
          // A blocked or interrupted AudioContext should never interrupt the page.
        }
      }

      if (context.state === 'suspended') {
        void context.resume().then(schedule).catch(() => {})
      } else {
        schedule()
      }
    }

    previewSoundRef.current = () => playClick(true)

    const onPointerDown = (event: PointerEvent) => {
      track = null
      if (!event.isPrimary || event.button !== 0) return
      if (event.target instanceof Element) {
        if (event.target.closest('[data-no-splash]')) return
        if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      }
      if (isScrollbarInteraction(event)) return

      const target = event.target instanceof Element ? event.target : null
      track = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
        pointerType: event.pointerType,
        interactive: Boolean(target?.closest(INTERACTIVE_SELECTOR)),
        moved: false,
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!track || event.pointerId !== track.id || track.moved) return
      const threshold = track.pointerType === 'touch' ? 12 : 7
      if (Math.hypot(event.clientX - track.x, event.clientY - track.y) > threshold) {
        track.moved = true
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!track || event.pointerId !== track.id) return
      const press = track
      track = null

      if (press.moved) return
      if (isScrollbarInteraction(event)) return
      if (performance.now() - press.time > (press.pointerType === 'touch' ? 500 : 650)) return
      if (
        Math.hypot(event.clientX - press.x, event.clientY - press.y) >
        (press.pointerType === 'touch' ? 14 : 8)
      ) {
        return
      }

      playClick(press.interactive)
      window.dispatchEvent(
        new CustomEvent<TapDetail>('honeycomb:tap', {
          detail: { x: event.clientX, y: event.clientY, interactive: press.interactive },
        }),
      )
    }

    const cancel = () => {
      track = null
    }

    const onVisibility = () => {
      if (document.hidden) cancel()
    }

    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', cancel)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('blur', cancel)
      document.removeEventListener('visibilitychange', onVisibility)
      previewSoundRef.current = null
      if (audioContext) {
        const closing = audioContext
        audioContext = null
        void closing.close().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return

    const particles: Honeycomb[] = []
    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    let previousX = 0
    let previousY = 0
    let hasPrevious = false
    let lastMove = 0
    let moveCarry = 0
    let moving = false
    let idleTimer = 0

    let raf = 0
    let running = false
    let lastFrame = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles.length = 0
    }
    resize()

    const spawn = (x: number, y: number, speed: number, tone: Tone) => {      if (particles.length >= MAX_HONEYCOMBS) return
      const boost = Math.min(speed / 1.6, 1)
      const spread = 3 + boost * 10
      const angle = Math.random() * TAU
      const offset = Math.random() * spread
      particles.push({
        x: x + Math.cos(angle) * offset,
        y: y + Math.sin(angle) * offset,
        radius: 8 + Math.random() * 7 + boost * 7,
        rotation: Math.random() * TAU,
        spin: (Math.random() - 0.5) * 0.02,
        alpha: 0.55 + Math.random() * 0.4,
        decay: 0.009 + Math.random() * 0.008,
        vx: (Math.random() - 0.5) * (0.5 + boost * 1.2),
        vy: (Math.random() - 0.5) * (0.5 + boost * 1.2) - 0.1,
        tone,
        shrink: 0.006,
        burst: false,
        core: false,
        originX: x,
        originY: y,
      })
    }

    const spawnBurst = (x: number, y: number, tone: Tone, interactive: boolean) => {
      if (particles.length > MAX_HONEYCOMBS + 80) return
      const count = interactive ? 18 : 14
      const startAngle = Math.random() * TAU
      const baseSpeed = 2.4 + Math.random() * 1.2

      for (let index = 0; index < count; index += 1) {
        const angle = startAngle + (index / count) * TAU + (Math.random() - 0.5) * 0.3
        const velocity = baseSpeed + Math.random() * 3.4
        const offset = 1.5 + Math.random() * 2.5
        const radius = 2.6 + Math.random() * 4.4
        const alpha = 0.72 + Math.random() * 0.26
        const startX = x + Math.cos(angle) * offset
        const startY = y + Math.sin(angle) * offset
        particles.push({
          x: startX,
          y: startY,
          radius,
          rotation: Math.random() * TAU,
          spin: (Math.random() - 0.5) * 0.2,
          alpha,
          decay: 0.07 + Math.random() * 0.03,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          tone,
          shrink: 0.035 + Math.random() * 0.025,
          burst: true,
          core: false,
          originX: x,
          originY: y,
          born: -1,
          life: 190 + Math.random() * 60,
          startX,
          startY,
          baseAlpha: alpha,
          baseRadius: radius,
        })
      }

      // Brief flash at the exact impact point
      particles.push({
        x,
        y,
        radius: interactive ? 10 : 8,
        rotation: Math.random() * TAU,
        spin: 0,
        alpha: 0.88,
        decay: 0.12,
        vx: 0,
        vy: 0,
        tone,
        shrink: 0.02,
        burst: true,
        core: true,
        originX: x,
        originY: y,
        born: -1,
        life: 120,
        startX: x,
        startY: y,
        baseAlpha: 0.88,
        baseRadius: interactive ? 10 : 8,
      })
      start()
    }

    const debugSnapshot = () =>
      particles.map((p) => ({
        x: Math.round(p.x),
        y: Math.round(p.y),
        alpha: +p.alpha.toFixed(3),
        radius: +p.radius.toFixed(1),
        burst: p.burst,
        core: p.core,
        vx: +p.vx.toFixed(2),
        vy: +p.vy.toFixed(2),
        decay: +p.decay.toFixed(3),
        tone: p.tone,
      }))
    ;(window as Window & { __honeyDebug?: () => unknown }).__honeyDebug = debugSnapshot

    const render = (now: number) => {
      const elapsed = lastFrame ? now - lastFrame : 0
      lastFrame = now
      const step = Math.min(Math.max(elapsed, 0), 34) / 16.67
      ;(window as Window & { __honeyRender?: unknown }).__honeyRender = {
        now: +now.toFixed(0),
        step: +step.toFixed(2),
        frames: particles.filter((p) => p.burst).map((p) => ({ born: p.born, life: p.life, age: p.born !== undefined && p.born >= 0 ? +(now - p.born).toFixed(0) : -1 })),
      }

      context.clearRect(0, 0, width, height)
      context.lineJoin = 'round'
      context.shadowBlur = 0

      // Threads from the impact point to every radiating shard.
      context.lineWidth = 0.9
      for (let i = 0; i < particles.length; i += 1) {
        const shard = particles[i]
        if (!shard.burst || shard.core) continue
        const alpha = shard.alpha * 0.58
        if (alpha < 0.02) continue
        context.globalAlpha = alpha
        context.strokeStyle = accentFor(shard.tone)
        context.beginPath()
        context.moveTo(shard.originX, shard.originY)
        context.lineTo(shard.x, shard.y)
        context.stroke()
      }

      // Thin digital filaments between neighbouring honeycombs
      context.lineWidth = 0.9
      let linkColor = ''
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          if (Math.abs(dx) > LINK_DISTANCE || Math.abs(dy) > LINK_DISTANCE) continue
          const distance = Math.hypot(dx, dy)
          if (distance > LINK_DISTANCE) continue
          const alpha = Math.min(a.alpha, b.alpha) * (1 - distance / LINK_DISTANCE) * 0.42
          if (alpha < 0.015) continue
          const color = accentFor(a.tone)
          if (color !== linkColor) {
            context.strokeStyle = color
            linkColor = color
          }
          context.globalAlpha = alpha
          context.beginPath()
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.stroke()
        }
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i]

        if (particle.burst) {
          if ((particle.born ?? -1) < 0) particle.born = now
          const age = Math.max(0, now - (particle.born ?? now))
          const life = particle.life ?? 240
          const progress = Math.min(age / life, 1)
          if (progress >= 1) {
            particles.splice(i, 1)
            continue
          }
          particle.alpha = (particle.baseAlpha ?? particle.alpha) * (1 - progress)
          particle.radius = (particle.baseRadius ?? particle.radius) * (1 - progress * 0.55)
          particle.x = (particle.startX ?? particle.x) + particle.vx * (age / 16.67)
          particle.y = (particle.startY ?? particle.y) + particle.vy * (age / 16.67)
          particle.rotation += particle.spin * step
        } else {
          particle.alpha -= particle.decay * step
          particle.radius *= 1 - particle.shrink * step
          particle.x += particle.vx * step
          particle.y += particle.vy * step
          particle.rotation += particle.spin * step

          if (particle.alpha <= 0.02 || particle.radius <= 1.4) {
            particles.splice(i, 1)
            continue
          }
        }

        const white = particle.tone === 'orange'
        const accent = white ? '#FFFFFF' : particle.tone === 'dark' ? ORANGE_HOT : ORANGE

        context.save()
        context.translate(particle.x, particle.y)
        context.rotate(particle.rotation)
        traceHex(context, particle.radius)

        // Heavily transparent honey fill
        context.globalAlpha = particle.alpha * (white ? 0.18 : 0.3)
        context.fillStyle = white ? '#FFFFFF' : ORANGE
        context.fill()

        // Dark pencil outline keeps the orange legible over pale sections
        if (!white && particle.tone !== 'dark') {
          context.globalAlpha = particle.alpha * 0.52
          context.lineWidth = 2.8
          context.strokeStyle = 'rgba(23, 23, 23, 0.5)'
          context.stroke()
        }

        context.globalAlpha = particle.alpha
        context.lineWidth = white ? 1.3 : particle.tone === 'dark' ? 1.45 : 1.25
        if (particle.burst) context.lineWidth += 0.25
        context.strokeStyle = accent
        context.shadowColor = white
          ? 'rgba(255, 255, 255, 0.7)'
          : particle.tone === 'dark'
            ? 'rgba(255, 106, 0, 0.8)'
            : particle.tone === 'mid'
              ? 'rgba(110, 24, 0, 0.6)'
              : 'rgba(255, 87, 34, 0.5)'
        context.shadowBlur = white ? 10 : particle.tone === 'dark' ? 14 : 10
        if (particle.burst) context.shadowBlur += 3
        context.stroke()
        context.restore()
      }

      context.globalAlpha = 1
      context.shadowBlur = 0

      if (particles.length > 0) {
        raf = window.requestAnimationFrame(render)
      } else {
        running = false
        raf = 0
        context.clearRect(0, 0, width, height)
      }
    }

    const start = () => {
      if (running) return
      running = true
      lastFrame = 0
      raf = window.requestAnimationFrame(render)
    }

    const onMove = (event: PointerEvent) => {
      const now = performance.now()
      const x = event.clientX
      const y = event.clientY

      if (!hasPrevious) {
        previousX = x
        previousY = y
        hasPrevious = true
        lastMove = now
        moving = true
        return
      }

      const dx = x - previousX
      const dy = y - previousY
      const distance = Math.hypot(dx, dy)
      const elapsed = Math.max(now - lastMove, 1)
      const speed = distance / elapsed

      const fromX = previousX
      const fromY = previousY
      previousX = x
      previousY = y
      lastMove = now
      moving = true
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        moving = false
      }, 55)

      if (!moving || distance < 0.8) return

      moveCarry += Math.min(distance, 140)
      const spacing = speed > 0.6 ? 11 : speed > 0.25 ? 16 : 22
      let count = Math.floor(moveCarry / spacing)
      if (count <= 0) return
      moveCarry -= count * spacing
      count = Math.min(count, 5)

      const tone = toneAt(x, y)
      for (let index = 1; index <= count; index += 1) {
        const ratio = index / (count + 1)
        spawn(fromX + dx * ratio, fromY + dy * ratio, speed, tone)
      }
      start()
    }

    const onTap = (event: Event) => {
      const detail = (event as CustomEvent<TapDetail>).detail
      if (!detail || !Number.isFinite(detail.x) || !Number.isFinite(detail.y)) return
      spawnBurst(detail.x, detail.y, toneAt(detail.x, detail.y), detail.interactive)
    }

    const onLeave = () => {
      hasPrevious = false
      moving = false
      window.clearTimeout(idleTimer)
    }

    const onVisibility = () => {
      if (!document.hidden) return
      particles.length = 0
      moving = false
      hasPrevious = false
      window.clearTimeout(idleTimer)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('honeycomb:tap', onTap)
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('honeycomb:tap', onTap)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearTimeout(idleTimer)
      window.cancelAnimationFrame(raf)
      particles.length = 0
      context.clearRect(0, 0, width, height)
      delete (window as Window & { __honeyDebug?: () => unknown }).__honeyDebug
    }
  }, [])

  const toggleSound = () => {
    const next = !muted
    mutedRef.current = next
    window.userWantsSilence = next
    setMuted(next)
    if (!next) previewSoundRef.current?.()
  }

  return (
    <>
      <canvas id="honeycomb-trail-canvas" ref={canvasRef} aria-hidden="true" />
      <button
        type="button"
        className="sound-toggle"
        data-no-splash="true"
        data-cursor="AUDIO"
        aria-label="Click sound"
        aria-pressed={!muted}
        title={muted ? 'Enable click sound' : 'Mute click sound'}
        onClick={toggleSound}
      >
        {muted ? <VolumeX size={15} strokeWidth={1.8} /> : <Volume2 size={15} strokeWidth={1.8} />}
      </button>
    </>
  )
}
