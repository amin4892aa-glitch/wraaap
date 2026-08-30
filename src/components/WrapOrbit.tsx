import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, Environment } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import './WrapOrbit.css'

function TortillaWrap({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.35
  })

  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.55}>
      <group ref={group} position={position} rotation={[0.35, 0.4, -0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.42, 0.42, 1.55, 48]} />
          <meshStandardMaterial color="#e8c39a" roughness={0.72} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 1.35, 32]} />
          <meshStandardMaterial color="#8fb85a" roughness={0.85} />
        </mesh>
        <mesh position={[0.12, 0.1, 0.2]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#d85a42" roughness={0.55} />
        </mesh>
        <mesh position={[-0.1, -0.15, 0.18]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#6b8f3d" roughness={0.7} />
        </mesh>
      </group>
    </Float>
  )
}

function IngredientBits() {
  const bits = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        color: ['#d85a42', '#8fb85a', '#e8c39a', '#f2d27a', '#c98d63'][i % 5],
        position: [
          (Math.sin(i * 1.7) * 1.8) as number,
          (0.2 + (i % 5) * 0.18) as number,
          (Math.cos(i * 1.3) * 1.5) as number,
        ] as [number, number, number],
        scale: 0.06 + (i % 4) * 0.02,
        speed: 0.6 + (i % 5) * 0.15,
      })),
    [],
  )

  return (
    <>
      {bits.map((bit) => (
        <Float key={bit.id} speed={bit.speed} floatIntensity={0.8} rotationIntensity={1.2}>
          <mesh position={bit.position} castShadow>
            <icosahedronGeometry args={[bit.scale, 0]} />
            <meshStandardMaterial color={bit.color} roughness={0.45} />
          </mesh>
        </Float>
      ))}
    </>
  )
}

export function WrapOrbit() {
  return (
    <div className="wrap-orbit" aria-hidden>
      <Canvas
        camera={{ position: [0, 0.6, 4.2], fov: 42 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#1a120c']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 2]} intensity={1.35} castShadow />
        <Environment preset="warehouse" />
        <TortillaWrap position={[0, 0.15, 0]} />
        <IngredientBits />
        <ContactShadows position={[0, -1.05, 0]} opacity={0.45} scale={8} blur={2.4} />
      </Canvas>
    </div>
  )
}
