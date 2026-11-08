import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const words = ['CODE.', 'CREATE.', 'CONQUER.']
const Atmosphere = lazy(() => import('./Atmosphere'))

function DeferredHeroAtmosphere() {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useLayoutEffect(() => {
    const node = host.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '100px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <div ref={host} className="hero-atmosphere" aria-hidden="true">{visible && <Suspense fallback={null}><Atmosphere /></Suspense>}</div>
}

export default function FlipIntro({ loading }: { loading: boolean }) {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const face = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    if (loading) return
    const context = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.fromTo('.intro-meta', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, delay: 0.25, ease: 'power3.out' })
      gsap.fromTo('.hero-word', { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: reduced ? 0.01 : 1.05, stagger: 0.13, delay: 0.25, ease: 'power4.out' })
      gsap.to('.hero-index', { y: -20, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
      if (!reduced) {
        gsap.to(face.current, {
          rotateX: 180,
          ease: 'none',
          scrollTrigger: {
            trigger: stage.current,
            start: 'top top',
            end: '+=1150',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      }
      gsap.fromTo('.about-reveal', { y: 38, opacity: 0 }, {
        y: 0, opacity: 1, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.about-section', start: 'top 75%', end: 'top 35%', scrub: 0.7 },
      })
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((item) => {
        gsap.fromTo(item, { y: 36, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        })
      })
    }, root)
    return () => context.revert()
  }, [loading])

  return <>
    <section className="hero" id="home" ref={root}>
      <DeferredHeroAtmosphere />
      <div className="hero-top intro-meta">
        <a className="wordmark" href="#home" aria-label="P. Krishaanth, home">PK<span>®</span></a>
        <p>INDEPENDENTLY CURIOUS<br />SINCE APPROXIMATELY FOREVER</p>
        <span className="hero-top-right">PORTFOLIO&nbsp; / &nbsp;2026</span>
      </div>
      <div className="hero-heading" ref={title}>
        {words.map((word, i) => <div className={`hero-word-wrap hero-line-${i + 1}`} key={word}>
          <h1 className="hero-word">{word}</h1>
          {i === 1 && <span className="hero-side-note">A STUDENT WITH<br />OPEN TABS & BIG IDEAS</span>}
          {i === 2 && <span className="hero-stamp">VIT CHENNAI<br />CSE · CLASS OF 2030</span>}
        </div>)}
      </div>
      <div className="hero-bottom intro-meta">
        <span className="hero-index">01 — THE OPENING ACT</span>
        <a className="scroll-cue" href="#flip"><span>SCROLL TO SEE WHAT HAPPENS</span><i>↓</i></a>
        <span className="hero-location">13°04' N &nbsp; 80°16' E</span>
      </div>
    </section>

    <section className="flip-stage" id="flip" ref={stage} aria-label="A scroll-controlled 180 degree introduction">
      <div className="flip-hud"><span>ONE PAGE. TWO SIDES.</span><span>SCROLL TO TURN ↘</span></div>
      <div className="flip-perspective">
        <div className="flip-card" ref={face}>
          <div className="flip-face flip-front">
            <div className="flip-front-kicker">A SMALL INTRODUCTION TO A LARGER LEARNING CURVE</div>
            <div className="flip-front-words"><span>STILL</span><span>BECOMING.</span></div>
            <div className="flip-front-foot"><span>P. KRISHAANTH / A WORK IN PROGRESS</span><span>FLIP SIDE →</span></div>
          </div>
          <div className="flip-face flip-back">
            <div className="flip-back-grid">
              <div className="flip-back-title"><span className="eyebrow">THE HUMAN BEHIND THE COMMIT HISTORY</span><h2>ABOUT<br />ME<span className="orange-dot">.</span></h2><span className="back-name">P. KRISHAANTH</span></div>
              <div className="flip-back-image"><img src="/projects/profilepic.jpeg" alt="P. Krishaanth" /></div>
              <p className="flip-back-copy">An engineering student. Not a professional overthinker.<br /><em>Yet.</em></p>
              <div className="flip-back-index">02 / IDENTITY</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flip-caption"><span>180° OF CONTEXT</span><span>NO CUTS. JUST A TURN.</span></div>
    </section>
  </>
}
