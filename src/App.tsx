import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Menu, X } from 'lucide-react'
import FlipIntro from './components/FlipIntro'
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
  const ink = useRef<HTMLDivElement>(null)
  const drag = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let frame = 0
    const move = (event: PointerEvent) => {
      document.body.classList.add('cursor-visible')
      x = event.clientX
      y = event.clientY
      const target = event.target as Element | null
      if (target) {
        document.body.classList.toggle('cursor-hover', Boolean(target.closest('a, button, [role="button"]')))
      }
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        if (ink.current) ink.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
        if (drag.current) drag.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })
    }
    const down = () => document.body.classList.add('cursor-pressed')
    const up = () => document.body.classList.remove('cursor-pressed')
    const enter = () => document.body.classList.add('cursor-visible')
    const leave = () => document.body.classList.remove('cursor-visible', 'cursor-hover')
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    document.addEventListener('pointerenter', enter)
    document.addEventListener('pointerleave', leave)

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      document.removeEventListener('pointerenter', enter)
      document.removeEventListener('pointerleave', leave)
      window.cancelAnimationFrame(frame)
      document.body.classList.remove('cursor-visible', 'cursor-pressed', 'cursor-hover')
    }
  }, [])

  return <><div className="cursor-drag" ref={drag} aria-hidden="true"/><div className="cursor-ink" ref={ink} aria-hidden="true"/></>
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
  return <><LoadingScreen active={loading}/><div className="site-content" aria-hidden={loading}><Navigation/><FlipIntro loading={loading}/><Sections/><CustomCursor/></div></>
}
