import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function ParticleField() {
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const values = new Float32Array(360 * 3)
    for (let i = 0; i < 360; i += 1) {
      values[i * 3] = (Math.random() - 0.5) * 11
      values[i * 3 + 1] = (Math.random() - 0.5) * 9
      values[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    return values
  }, [])
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.014
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.08
    }
  })
  return <points ref={ref} frustumCulled>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} itemSize={3} />
    </bufferGeometry>
    <pointsMaterial transparent color="#ffd4bc" size={0.022} sizeAttenuation depthWrite={false} opacity={0.62} />
  </points>
}

function Orb() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.12
      ref.current.rotation.z += delta * 0.04
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06
    }
  })
  return <mesh ref={ref} position={[2.9, -0.12, -0.3]}>
    <icosahedronGeometry args={[1.68, 3]} />
    <meshStandardMaterial color="#ee592c" roughness={0.5} metalness={0.08} emissive="#4c1708" emissiveIntensity={0.18} flatShading />
  </mesh>
}

export default function Atmosphere() {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700
  return <div className="atmosphere" aria-hidden="true">
    <Canvas dpr={[1, mobile ? 1 : 1.2]} camera={{ position: [0, 0, 9], fov: 44 }} gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 5, 6]} intensity={2.4} color="#fff1e8" />
      {!reduced && <><ParticleField /><Orb /></>}
    </Canvas>
  </div>
}
