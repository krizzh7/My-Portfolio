import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Menu, X } from 'lucide-react'
import FlipIntro from './components/FlipIntro'
import HoneycombTrail from './components/HoneycombTrail'
import LoadingScreen from './components/LoadingScreen'
import Sections from './components/Sections'

const navigation = [
  ['ABOUT', '#about'], ['PROJECTS', '#projects'], ['HACKATHONS', '#hackathons'], ['SKILLS', '#skills'], ['CONTACT', '#contact'],
]

function Navigation() {
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
      const sections = ['home', 'about', 'projects', 'hackathons', 'skills', 'education', 'contact']
      let current = 'home'
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.44) current = id
      }
      setActive(current)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])
  return <>
    <div className="progress-line" style={{ transform: `scaleX(${progress})` }} />
    <nav className={`site-nav ${open ? 'nav-open' : ''}`} aria-label="Main navigation">
      <a href="#home" className="nav-brand" onClick={() => setOpen(false)}>PK<span>®</span></a>
      <div className="nav-links">{navigation.map(([label, href]) => <a href={href} key={label} className={active === href.slice(1) ? 'active' : ''}>{label}<i/></a>)}</div>
      <a className="nav-availability" href="mailto:krishaanth.partha@gmail.com"><span/> OPEN TO IDEAS</a>
      <button className="nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
    </nav>
    <button className="backtop-float" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={16}/></button>
  </>
}

function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const follow = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return

    const body = document.body
    const INTERACTIVE = 'a, button, [role="button"], [data-cursor], .reel-card, .reel-strip'
    const LABELS: Array<[string, string]> = [
      ['.contact-cta', 'SAY HI'],
      ['.run-projects-btn', 'PLAY'],
      ['.reel-card', 'VIEW'],
      ['.reel-title', 'GO'],
      ['.reel-detail-next', 'NEXT'],
      ['.reel-footer-right', 'NEXT'],
      ['.reel-detail-back', 'BACK'],
      ['.reel-bar-return', 'BACK'],
      ['.reel-strip', 'DRAG'],
      ['a[href^="mailto"]', 'MAIL'],
      ['a[href^="http"]', 'OPEN'],
    ]

    let targetX = 0
    let targetY = 0
    let ringX = 0
    let ringY = 0
    let started = false
    let frame = 0
    let hovering = false
    let currentLabel = ''

    const paintDot = () => {
      if (dot.current) dot.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`
    }
    const paintRing = () => {
      if (follow.current) follow.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
    }
    const tick = () => {
      ringX += (targetX - ringX) * 0.2
      ringY += (targetY - ringY) * 0.2
      paintRing()
      if (Math.abs(targetX - ringX) + Math.abs(targetY - ringY) > 0.15) {
        frame = window.requestAnimationFrame(tick)
      } else {
        ringX = targetX
        ringY = targetY
        paintRing()
        frame = 0
      }
    }
    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(tick)
    }

    const resolve = (node: EventTarget | null) => {
      if (!(node instanceof Element)) return { hovering: false, label: '' }
      const el = node.closest(INTERACTIVE)
      if (!el) return { hovering: false, label: '' }
      const custom = el.getAttribute('data-cursor')
      if (custom) return { hovering: true, label: custom.toUpperCase() }
      for (const [selector, text] of LABELS) {
        if (el.matches(selector)) return { hovering: true, label: text }
      }
      return { hovering: true, label: '' }
    }

    const move = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      if (!started) {
        started = true
        ringX = targetX
        ringY = targetY
        paintRing()
      }
      paintDot()
      body.classList.add('cursor-active', 'cursor-visible')

      const next = resolve(event.target)
      if (next.hovering !== hovering || next.label !== currentLabel) {
        hovering = next.hovering
        currentLabel = next.label
        body.classList.toggle('cursor-hover', hovering)
        body.classList.toggle('cursor-has-label', Boolean(currentLabel))
        if (label.current) label.current.textContent = currentLabel
      }
      start()
    }
    const down = () => body.classList.add('cursor-pressed')
    const up = () => body.classList.remove('cursor-pressed')
    const enter = () => {
      if (started) body.classList.add('cursor-visible')
    }
    const leave = () => body.classList.remove('cursor-visible', 'cursor-hover', 'cursor-has-label', 'cursor-pressed')
    const visibility = () => {
      if (document.hidden) leave()
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('blur', leave)
    document.addEventListener('pointerenter', enter)
    document.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', visibility)

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('blur', leave)
      document.removeEventListener('pointerenter', enter)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', visibility)
      window.cancelAnimationFrame(frame)
      body.classList.remove('cursor-active', 'cursor-visible', 'cursor-pressed', 'cursor-hover', 'cursor-has-label')
    }
  }, [])

  return <>
    <div className="cursor-follow" ref={follow} aria-hidden="true">
      <div className="cursor-ring"><span className="cursor-label" ref={label}/></div>
    </div>
    <div className="cursor-dot" ref={dot} aria-hidden="true"/>
  </>
}

export default function App() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    document.documentElement.classList.add('motion-ready', 'boot-lock')
    const started = performance.now()
    const content = document.querySelector<HTMLElement>('.site-content')
    if (content) content.inert = true
    const minimumDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2200
    let disposed = false
    let timeout = 0

    const finish = () => {
      if (disposed) return
      window.clearTimeout(timeout)
      const remaining = Math.max(0, minimumDuration - (performance.now() - started))
      timeout = window.setTimeout(() => {
        if (disposed) return
        document.documentElement.classList.remove('boot-lock')
        if (content) content.inert = false
        setLoading(false)
      }, remaining)
    }

    timeout = window.setTimeout(finish, 2500)
    void Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((resolve) => window.setTimeout(resolve, 1600)),
    ]).then(finish)

    return () => {
      disposed = true
      window.clearTimeout(timeout)
      document.documentElement.classList.remove('motion-ready', 'boot-lock')
    }
  }, [])
  return <><LoadingScreen active={loading}/><div className="site-content" aria-hidden={loading}><Navigation/><FlipIntro loading={loading}/><Sections/><CustomCursor/></div><HoneycombTrail/></>
}
