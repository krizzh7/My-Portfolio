import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type TouchEvent as ReactTouchEvent } from 'react'
import gsap from 'gsap'
import { profile, projects } from '../data/portfolio'

interface ProjectsGalleryProps {
  onClose: () => void
}

const pad = (value: number) => String(value).padStart(2, '0')
const total = projects.length

export default function ProjectsGallery({ onClose }: ProjectsGalleryProps) {
  const [active, setActive] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const [direction, setDirection] = useState(1)

  const rootRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLButtonElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const unlockTimer = useRef(0)
  const wheelAt = useRef(0)
  const touchStart = useRef(0)
  const swipeBlock = useRef(false)

  const project = projects[active]
  const previous = projects[(active - 1 + total) % total]
  const next = projects[(active + 1) % total]

  const transitionTo = useCallback((target: number, dir?: number) => {
    if (busy.current || detailOpen) return
    const nextIndex = ((target % total) + total) % total
    if (nextIndex === active) return

    const forward = (nextIndex - active + total) % total
    const resolvedDirection = dir ?? (forward <= total / 2 ? 1 : -1)
    busy.current = true

    const timeline = gsap.timeline({
      onComplete: () => {
        setDirection(resolvedDirection)
        setActive(nextIndex)
      },
    })

    if (cardRef.current) {
      timeline.to(cardRef.current, { y: -resolvedDirection * 36, opacity: 0, scale: 0.98, duration: 0.24, ease: 'power2.in' }, 0)
    }
    if (stripRef.current) {
      timeline.to(stripRef.current, { y: -resolvedDirection * 20, duration: 0.28, ease: 'power2.in' }, 0)
    }
    timeline.to('.reel-anim', { opacity: 0, y: -resolvedDirection * 5, duration: 0.16, stagger: 0.008, ease: 'power1.in' }, 0)

    window.clearTimeout(unlockTimer.current)
    unlockTimer.current = window.setTimeout(() => { busy.current = false }, 1000)
  }, [active, detailOpen])

  const step = useCallback((delta: number) => {
    transitionTo(active + delta, delta > 0 ? 1 : -1)
  }, [active, transitionTo])

  const openDetail = () => {
    if (busy.current || swipeBlock.current) return
    setDetailOpen(true)
  }

  const closeDetail = useCallback(() => {
    const node = detailRef.current
    if (!node) {
      setDetailOpen(false)
      return
    }
    gsap.to(node, {
      opacity: 0,
      y: 10,
      duration: 0.26,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(node, { clearProps: 'all' })
        setDetailOpen(false)
      },
    })
  }, [])

  const detailNext = () => {
    const node = detailRef.current
    const advance = () => {
      setDirection(1)
      setActive((current) => (current + 1) % total)
    }
    if (!node) {
      advance()
      return
    }
    gsap.to(node, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        advance()
        node.scrollTop = 0
        window.requestAnimationFrame(() => {
          if (detailRef.current) gsap.to(detailRef.current, { opacity: 1, duration: 0.36, ease: 'power2.out' })
        })
      },
    })
  }

  /* Lock the portfolio behind the reel without losing its scroll position. */
  useEffect(() => {
    const body = document.body
    const html = document.documentElement
    const previousBodyOverflow = body.style.overflow
    const previousHtmlOverflow = html.style.overflow
    const previousPadding = body.style.paddingRight
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const scrollbar = window.innerWidth - html.clientWidth

    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    body.classList.add('reel-open')
    rootRef.current?.focus({ preventScroll: true })

    return () => {
      body.style.overflow = previousBodyOverflow
      html.style.overflow = previousHtmlOverflow
      body.style.paddingRight = previousPadding
      body.classList.remove('reel-open')
      window.clearTimeout(unlockTimer.current)
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  /* First paint: masthead, bar, filmstrip and HUD arrive as one composition. */
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' })
      gsap.fromTo('.reel-masthead-mark', { yPercent: 18, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.05, ease: 'power4.out' })
      gsap.fromTo('.reel-bar', { yPercent: -120 }, { yPercent: 0, duration: 0.7, delay: 0.08, ease: 'power3.out' })
      gsap.fromTo('.reel-strip', { opacity: 0 }, { opacity: 1, duration: 0.9, delay: 0.18, ease: 'power2.out' })
      gsap.fromTo('.reel-hud', { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.24, ease: 'power2.out' })
      gsap.fromTo('.reel-footer-left, .reel-footer-right', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55, delay: 0.32, stagger: 0.05, ease: 'power3.out' })
    }, rootRef)

    return () => context.revert()
  }, [])

  /* Reel swap: image and filmstrip move in the direction of travel. */
  useLayoutEffect(() => {
    const timeline = gsap.timeline({
      onComplete: () => {
        busy.current = false
        window.clearTimeout(unlockTimer.current)
      },
    })

    if (cardRef.current) {
      timeline.fromTo(cardRef.current, { y: direction * 48, opacity: 0, scale: 0.965 }, { y: 0, opacity: 1, scale: 1, duration: 0.72, ease: 'power3.out' }, 0)
    }
    if (stripRef.current) {
      timeline.fromTo(stripRef.current, { y: direction * 26 }, { y: 0, duration: 0.86, ease: 'power3.out' }, 0)
    }
    timeline.fromTo('.reel-anim', { opacity: 0, y: direction * 8 }, { opacity: 1, y: 0, duration: 0.46, stagger: 0.018, ease: 'power2.out' }, 0.05)

    return () => { timeline.kill() }
  }, [active, direction])

  /* Case study opening. */
  useLayoutEffect(() => {
    if (!detailOpen || !detailRef.current) return
    detailRef.current.scrollTop = 0
    const context = gsap.context(() => {
      gsap.fromTo(detailRef.current, { opacity: 0 }, { opacity: 1, duration: 0.38, ease: 'power2.out' })
      gsap.fromTo('.reel-detail-hero', { scale: 1.07, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.85, ease: 'power3.out' })
      gsap.fromTo('.reel-detail-reveal', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.055, delay: 0.12, ease: 'power2.out' })
    }, detailRef)

    return () => context.revert()
  }, [detailOpen, active])

  /* Wheel, keys and Escape. */
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (detailOpen) return
      if (Math.abs(event.deltaY) < 6) return
      event.preventDefault()
      const now = Date.now()
      if (now - wheelAt.current < 620) return
      wheelAt.current = now
      step(event.deltaY > 0 ? 1 : -1)
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (detailOpen) closeDetail()
        else onClose()
        return
      }
      if (detailOpen) return
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault()
        step(1)
      }
      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        step(-1)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [detailOpen, onClose, step, closeDetail])

  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (detailOpen) return
    touchStart.current = event.touches[0].clientY
  }

  const onTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (detailOpen) return
    const delta = touchStart.current - event.changedTouches[0].clientY
    if (Math.abs(delta) > 48) {
      swipeBlock.current = true
      step(delta > 0 ? 1 : -1)
      window.setTimeout(() => { swipeBlock.current = false }, 420)
    }
  }

  const onCardMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const node = event.currentTarget
    const rect = node.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12
    node.style.setProperty('--mx', `${x}px`)
    node.style.setProperty('--my', `${y}px`)
  }

  const onCardLeave = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty('--mx', '0px')
    event.currentTarget.style.setProperty('--my', '0px')
  }

  return (
    <div
      ref={rootRef}
      className="projects-reel"
      role="dialog"
      aria-modal="true"
      aria-label="Selected work, interactive project reel"
      tabIndex={-1}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <h1 className="sr-only">Selected Work</h1>

      {/* ZONE A — brutalist masthead + white information strip */}
      <header className="reel-head">
        <div className="reel-masthead" aria-hidden="true">
          <div className="reel-masthead-mark">
            <svg viewBox="0 0 1000 200" preserveAspectRatio="none" role="presentation">
              <text x="0" y="196" textLength="1000" lengthAdjust="spacingAndGlyphs" fontSize="232" fontWeight="700" fontFamily="'Space Grotesk', sans-serif" fill="#ffffff">WORK</text>
            </svg>
          </div>
        </div>
        <div className="reel-bar">
          <span className="reel-bar-left">PK — Creative Engineering Studio</span>
          <span className="reel-bar-center">
            <span className="reel-bar-selected">Selected Work</span>
            <span className="reel-bar-count">{pad(active + 1)} / {pad(total)}</span>
          </span>
          <button type="button" className="reel-bar-return" onClick={onClose}>← Return to Portfolio</button>
        </div>
      </header>

      {/* ZONE B — vertical filmstrip and the centered active project */}
      <div className="reel-strip" ref={stripRef} aria-hidden="true">
        <div className="reel-strip-slice reel-strip-prev" style={{ backgroundImage: `url(${previous.image})` }} />
        <div className="reel-strip-slice reel-strip-next" style={{ backgroundImage: `url(${next.image})` }} />
      </div>

      <div className="reel-stage">
        <button
          ref={cardRef}
          type="button"
          className="reel-card"
          onClick={openDetail}
          onPointerMove={onCardMove}
          onPointerLeave={onCardLeave}
          aria-label={`Open the ${project.shortTitle} case study`}
        >
          <img className="reel-card-img" src={project.image} alt={`${project.shortTitle} project preview`} draggable={false} />
          <span className="reel-card-corner">
            <b>{pad(active + 1)}</b>
            <i>{project.domain}</i>
          </span>
          <span className="reel-card-hit">
            <span>VIEW CASE STUDY <b>↗</b></span>
          </span>
        </button>
      </div>

      {/* ZONE C — hairline and four-column HUD */}
      <div className="reel-hairline" aria-hidden="true" />
      <div className="reel-hud">
        <span className="reel-hud-piece reel-hud-index reel-anim">{pad(active + 1)}</span>
        <span className="reel-hud-piece reel-hud-stack reel-anim">{project.stack}</span>
        <div className="reel-hud-titles" role="group" aria-label="Choose a project">
          {projects.map((item, index) => (
            <button
              key={item.number}
              type="button"
              className={`reel-title reel-anim ${index === active ? 'is-active' : ''}`}
              onClick={() => transitionTo(index)}
              aria-pressed={index === active}
            >
              {item.shortTitle}
            </button>
          ))}
        </div>
        <span className="reel-hud-piece reel-hud-domain reel-anim">{project.domain}</span>
      </div>

      {/* ZONE D — pinned footer */}
      <footer className="reel-footer">
        <a className="reel-footer-piece reel-footer-left" href={`mailto:${profile.email}`}>{profile.name} / {profile.email}</a>
        <div key={active} className="reel-footer-piece reel-footer-center reel-anim" aria-live="polite">
          {project.summary.map((line) => <span key={line}>{line}</span>)}
        </div>
        <button type="button" className="reel-footer-piece reel-footer-right" onClick={() => step(1)}>
          <span className="reel-hint-wide">SCROLL OR CLICK TO EXPLORE · [↑/↓]</span>
          <span className="reel-hint-touch">SWIPE UP / DOWN OR TAP A TITLE</span>
        </button>
      </footer>

      {/* Full case study */}
      {detailOpen && (
        <div ref={detailRef} className="reel-detail" role="document" aria-label={`${project.shortTitle} case study`}>
          <div className="reel-detail-top">
            <span className="reel-detail-topline">CASE STUDY / {pad(active + 1)} OF {pad(total)}</span>
            <button type="button" className="reel-detail-back" onClick={closeDetail}>← BACK TO REEL</button>
          </div>

          <div className="reel-detail-inner">
            <p className="reel-detail-eyebrow reel-detail-reveal">{project.domain} · {project.subtitle}</p>
            <h2 className="reel-detail-title reel-detail-reveal">
              <span>{project.title}</span>
              <em>{project.secondTitle}</em>
            </h2>

            <figure className="reel-detail-hero-wrap reel-detail-reveal">
              <img className="reel-detail-hero" src={project.image} alt={project.media[0].alt} />
              <figcaption>
                <span>FRAME 01 / {pad(project.media.length)}</span>
                <span>{project.media[0].caption}</span>
              </figcaption>
            </figure>

            <div className="reel-detail-grid reel-detail-reveal">
              <div>
                <span className="reel-detail-label">PROBLEM</span>
                <p>{project.problem}</p>
              </div>
              <div>
                <span className="reel-detail-label">SOLUTION</span>
                <p>{project.solution}</p>
              </div>
            </div>

            <div className="reel-detail-columns reel-detail-reveal">
              <div>
                <span className="reel-detail-label">KEY FEATURES</span>
                <ul className="reel-detail-features">
                  {project.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </div>
              <div>
                <span className="reel-detail-label">TECHNOLOGY STACK</span>
                <div className="reel-detail-tags">
                  {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="reel-detail-links">
                  {project.repo && (
                    <a href={project.repo} target="_blank" rel="noreferrer">VIEW REPOSITORY ↗</a>
                  )}
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noreferrer">LIVE EXPERIENCE ↗</a>
                  )}
                </div>
              </div>
            </div>

            {project.media.length > 1 && (
              <div className="reel-detail-media reel-detail-reveal">
                <span className="reel-detail-label">DOCUMENTED MEDIA</span>
                <div className="reel-detail-media-grid">
                  {project.media.slice(1).map((item, index) => (
                    <figure key={item.src}>
                      <img src={item.src} alt={item.alt} />
                      <figcaption><span>FRAME {pad(index + 2)}</span><span>{item.caption}</span></figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            <p className="reel-detail-note reel-detail-reveal"><span>↳</span>{project.note}</p>

            <div className="reel-detail-foot">
              <button type="button" className="reel-detail-back" onClick={closeDetail}>← BACK TO REEL</button>
              <button type="button" className="reel-detail-next" onClick={detailNext}>
                <span>NEXT PROJECT</span>
                <strong>{next.shortTitle}</strong>
                <b>→</b>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
