import { Canvas, useFrame } from '@react-three/fiber'
import {
  Environment,
  MeshReflectorMaterial,
  PerspectiveCamera,
} from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { WrapLayerId, WrapPaint } from '../data/wrapDesign'
import { WRAP_PAINTS } from '../data/wrapDesign'

export type { WrapPaint }
export { WRAP_PAINTS }

function has(layers: WrapLayerId[], id: WrapLayerId) {
  return layers.includes(id)
}

/** Cream / sauce smear along the open seam */
function SauceLayer({ color, y = 0 }: { color: string; y?: number }) {
  return (
    <mesh position={[0, y, 0.22]} rotation={[0.15, 0, 0]} castShadow>
      <boxGeometry args={[0.55, 0.06, 1.35]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.35}
        metalness={0.05}
        clearcoat={0.4}
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}

/** Protein strips */
function MeatStrips({ color }: { color: string }) {
  return (
    <group>
      {[-0.18, -0.02, 0.14].map((x, i) => (
        <mesh
          key={x}
          position={[x, 0.02 + i * 0.02, 0.12]}
          rotation={[0.1, 0, 0.08 * (i - 1)]}
          castShadow
        >
          <boxGeometry args={[0.14, 0.035, 1.2]} />
          <meshPhysicalMaterial color={color} roughness={0.55} metalness={0.08} />
        </mesh>
      ))}
    </group>
  )
}

/** Lettuce crinkles */
function LettuceBits({ color }: { color: string }) {
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.16, 0.08 + (i % 3) * 0.03, Math.sin(a) * 0.1 + 0.08]}
            rotation={[0.4, a, 0.3]}
            castShadow
          >
            <boxGeometry args={[0.16, 0.012, 0.22]} />
            <meshPhysicalMaterial color={color} roughness={0.7} metalness={0} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Corn kernels */
function CornKernels({ color }: { color: string }) {
  return (
    <group>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh
          key={i}
          position={[
            ((i % 5) - 2) * 0.08,
            0.05 + (i % 3) * 0.04,
            0.05 + Math.floor(i / 5) * 0.18 - 0.2,
          ]}
          castShadow
        >
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshPhysicalMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

/** Avocado slices */
function AvocadoSlices({ color }: { color: string }) {
  return (
    <group>
      {[-0.2, 0.05, 0.28].map((z, i) => (
        <mesh
          key={z}
          position={[-0.08 + i * 0.06, 0.1, z]}
          rotation={[0.2, 0.4, 0.6]}
          castShadow
        >
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.35}
            metalness={0.05}
            clearcoat={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Paprika / tomato strips & discs */
function PepperBits({ color, discs }: { color: string; discs?: boolean }) {
  if (discs) {
    return (
      <group>
        {[-0.25, 0, 0.28].map((z) => (
          <mesh key={z} position={[0.12, 0.12, z]} rotation={[1.2, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.025, 20]} />
            <meshPhysicalMaterial color={color} roughness={0.4} metalness={0.05} />
          </mesh>
        ))}
      </group>
    )
  }
  return (
    <group>
      {[-0.15, 0.1].map((x, i) => (
        <mesh
          key={x}
          position={[x, 0.14, 0.05]}
          rotation={[0.15, 0, 0.5 + i * 0.2]}
          castShadow
        >
          <boxGeometry args={[0.08, 0.03, 0.7]} />
          <meshPhysicalMaterial color={color} roughness={0.45} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

/** Onion rings */
function OnionRings({ color }: { color: string }) {
  return (
    <group>
      {[-0.2, 0.15].map((z) => (
        <mesh key={z} position={[0.05, 0.16, z]} rotation={[1.1, 0, 0.2]} castShadow>
          <torusGeometry args={[0.07, 0.015, 8, 24]} />
          <meshPhysicalMaterial color={color} roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

/** Hot sauce dollops */
function HotSauce({ color }: { color: string }) {
  return (
    <group>
      {[0.2, -0.15, 0.35].map((z, i) => (
        <mesh key={z} position={[-0.12 + i * 0.08, 0.18, z]} castShadow>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.25}
            metalness={0.1}
            clearcoat={0.8}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  )
}

function LightRings({ color, motion }: { color: string; motion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const rings = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        z: -1.1 - i * 1.1,
        scale: 1.1 + i * 0.07,
        opacity: Math.max(0.12, 0.8 - i * 0.05),
      })),
    [],
  )

  useFrame((_, delta) => {
    if (!group.current || !motion) return
    group.current.position.z += delta * 1.6
    if (group.current.position.z > 1.1) group.current.position.z = 0
  })

  return (
    <group ref={group}>
      {rings.map((ring) => (
        <mesh key={ring.z} position={[0, 0.2, ring.z]} scale={ring.scale}>
          <torusGeometry args={[2.05, 0.016, 10, 80]} />
          <meshBasicMaterial color={color} transparent opacity={ring.opacity} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function HeroWrap({
  paint,
  motion,
  layers,
}: {
  paint: WrapPaint
  motion: boolean
  layers: WrapLayerId[]
}) {
  const group = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!group.current) return
    if (motion) {
      group.current.rotation.y += delta * 0.4
      group.current.position.y = 0.38 + Math.sin(state.clock.elapsedTime * 1.1) * 0.035
    } else {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        0.85 + Math.sin(state.clock.elapsedTime * 0.2) * 0.12,
        0.04,
      )
      group.current.rotation.x = 0.15
      group.current.position.y = 0.38
    }
  })

  return (
    <group ref={group} position={[0, 0.38, 0.35]} rotation={[0.12, 0.9, -0.08]}>
      {/* Tortilla body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 1.7, 64, 1, false, 0, Math.PI * 1.65]} />
        <meshPhysicalMaterial
          color={paint.shell}
          roughness={0.45}
          metalness={0.08}
          clearcoat={0.35}
          clearcoatRoughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tortilla end caps / rolled tips */}
      <mesh position={[0, 0.82, 0]} rotation={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.38, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshPhysicalMaterial color={paint.shell} roughness={0.5} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.82, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <sphereGeometry args={[0.38, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshPhysicalMaterial color={paint.shell} roughness={0.5} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner liner so fill reads against shell */}
      <mesh>
        <cylinderGeometry args={[0.36, 0.36, 1.55, 48, 1, true]} />
        <meshStandardMaterial color="#f3e6d4" roughness={0.8} side={THREE.BackSide} />
      </mesh>

      {/* Fill stack — only selected layers */}
      {has(layers, 'frischkaese') && <SauceLayer color="#f7f1e4" y={-0.04} />}
      {has(layers, 'sambal') && <HotSauce color="#b33a28" />}
      {has(layers, 'pute') && <MeatStrips color="#e8a090" />}
      {has(layers, 'salat') && <LettuceBits color="#8fb85a" />}
      {has(layers, 'mais') && <CornKernels color="#f2d27a" />}
      {has(layers, 'avocado') && <AvocadoSlices color="#6b8f3d" />}
      {has(layers, 'paprika') && <PepperBits color="#d85a42" />}
      {has(layers, 'tomate') && <PepperBits color="#c43b2a" discs />}
      {has(layers, 'zwiebel') && <OnionRings color="#c9a0d4" />}
      {has(layers, 'sambal') && !has(layers, 'frischkaese') && (
        <SauceLayer color="#c44a35" y={-0.02} />
      )}
    </group>
  )
}

function CameraRig({ motion }: { motion: boolean }) {
  const cam = useRef<THREE.PerspectiveCamera>(null)
  useFrame((state) => {
    if (!cam.current) return
    const t = state.clock.elapsedTime
    const targetX = motion ? Math.sin(t * 0.3) * 0.45 : Math.sin(t * 0.12) * 0.15
    const targetY = motion ? 0.5 + Math.sin(t * 0.35) * 0.06 : 0.55
    const targetZ = motion ? 3.9 : 3.45
    cam.current.position.x = THREE.MathUtils.lerp(cam.current.position.x, targetX, 0.05)
    cam.current.position.y = THREE.MathUtils.lerp(cam.current.position.y, targetY, 0.05)
    cam.current.position.z = THREE.MathUtils.lerp(cam.current.position.z, targetZ, 0.05)
    cam.current.lookAt(0, 0.32, 0)
    cam.current.fov = motion ? 52 : 44
    cam.current.updateProjectionMatrix()
  })
  return <PerspectiveCamera ref={cam} makeDefault position={[0.2, 0.55, 3.5]} fov={46} />
}

type SceneProps = {
  paint: WrapPaint
  motion: boolean
  layers: WrapLayerId[]
}

function Scene({ paint, motion, layers }: SceneProps) {
  const chroma = useMemo(
    () => new THREE.Vector2(motion ? 0.0014 : 0.0006, motion ? 0.001 : 0.0004),
    [motion],
  )

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 7, 16]} />
      <CameraRig motion={motion} />
      <ambientLight intensity={0.35} />
      <spotLight
        position={[2, 5, 3]}
        angle={0.5}
        penumbra={0.75}
        intensity={2}
        color={paint.ring}
        castShadow
      />
      <pointLight position={[-2, 2, 2]} intensity={0.7} color={paint.accent} />
      <pointLight position={[0, 1, 3]} intensity={1.1} color="#fff5e8" />
      <Environment preset="warehouse" />

      <LightRings color={paint.ring} motion={motion} />
      <HeroWrap paint={paint} motion={motion} layers={layers} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[280, 70]}
          resolution={512}
          mixBlur={1}
          mixStrength={1.4}
          roughness={0.9}
          depthScale={0.7}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.2}
          color="#0a0a0a"
          metalness={0.65}
          mirror={0.55}
        />
      </mesh>

      <EffectComposer multisampling={0}>
        <Bloom intensity={motion ? 1.1 : 0.75} luminanceThreshold={0.4} mipmapBlur />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={chroma} />
        <Noise opacity={0.06} blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette eskil={false} offset={0.2} darkness={0.8} />
      </EffectComposer>
    </>
  )
}

type Props = {
  paint: WrapPaint
  motion: boolean
  layers?: WrapLayerId[]
}

export function StyleWrapScene({
  paint,
  motion,
  layers = ['tortilla', 'frischkaese', 'pute', 'salat', 'avocado'],
}: Props) {
  return (
    <Canvas
      className="style-canvas"
      dpr={[1, 1.75]}
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <Scene paint={paint} motion={motion} layers={layers} />
    </Canvas>
  )
}
