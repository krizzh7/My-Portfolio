import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  active: boolean
}

export default function LoadingScreen({ active }: LoadingScreenProps) {
  const [mounted, setMounted] = useState(active)

  useEffect(() => {
    if (active) {
      setMounted(true)
      return
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timer = window.setTimeout(() => setMounted(false), reducedMotion ? 0 : 850)
    return () => window.clearTimeout(timer)
  }, [active])

  if (!mounted) return null

  return <div className={`boot-screen ${active ? '' : 'boot-screen-exit'}`} aria-hidden={!active}>
    <div className="boot-content">
      <div className="boot-topline"><span>PK®</span><span>PORTFOLIO / 2026</span></div>
      <div className="boot-center">
        <div className="boot-monogram" aria-hidden="true">PK<span>.</span></div>
        <p className="boot-message">Hold on. Greatness takes a few milliseconds.</p>
        <div className="boot-progress" aria-hidden="true"><span /></div>
        <div className="boot-foot"><span>INITIALIZING BIG IDEAS</span><span>NO ACTUAL ROCKET SCIENCE</span></div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{active ? 'Loading portfolio' : ''}</p>
      <div className="boot-bottomline"><span>PLEASE STAND BY</span><span>YOUR PATIENCE IS BEING RENDERED</span></div>
    </div>
  </div>
}
