"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

type ChromaRigSceneProps = {
  palette: string[]
  activeScene: "color" | "preview" | "placement" | "result"
  lightCount: number
  aimAtEmpties: boolean
  reducedMotion: boolean
}

function LightBeam({
  color,
  index,
  count,
  generated,
  aimAtEmpties,
}: {
  color: string
  index: number
  count: number
  generated: boolean
  aimAtEmpties: boolean
}) {
  const spacing = count === 1 ? 0 : 4.4 / (count - 1)
  const x = count === 1 ? 0 : -2.2 + index * spacing
  const colorObject = useMemo(() => new THREE.Color(color), [color])
  const intensity = generated ? 0.82 : 0.42

  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.74, -0.22]}>
        <sphereGeometry args={[0.18, 28, 28]} />
        <meshStandardMaterial color={colorObject} emissive={colorObject} emissiveIntensity={1.7} />
      </mesh>
      <mesh position={[0, 0.78, -0.2]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.62, 2.0, 42, 1, true]} />
        <meshBasicMaterial color={colorObject} transparent opacity={intensity * 0.32} side={THREE.DoubleSide} />
      </mesh>
      {aimAtEmpties && (
        <mesh position={[0, -0.26, 0.02]}>
          <torusGeometry args={[0.18, 0.012, 10, 30]} />
          <meshBasicMaterial color={colorObject} />
        </mesh>
      )}
    </group>
  )
}

function PaletteRail({ palette, active }: { palette: string[]; active: boolean }) {
  return (
    <group position={[0, -1.45, 0]}>
      {palette.map((color, index) => (
        <mesh key={color + index} position={[-1.35 + index * 0.9, 0, 0]}>
          <boxGeometry args={[0.58, active ? 0.18 : 0.08, 0.12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.42 : 0.12} />
        </mesh>
      ))}
    </group>
  )
}

function RigPreview(props: ChromaRigSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const visibleLights = props.activeScene === "color" ? 1 : props.lightCount
  const generated = props.activeScene === "result"
  const showPalette = props.activeScene !== "color"

  useFrame((state) => {
    if (!groupRef.current || props.reducedMotion) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.32) * 0.08
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.025, 18, 96]} />
        <meshStandardMaterial color="#25f29a" emissive="#25f29a" emissiveIntensity={generated ? 0.7 : 0.18} />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 28]} />
        <meshStandardMaterial color="#c7d1cd" metalness={0.6} roughness={0.25} />
      </mesh>
      {props.aimAtEmpties && (
        <mesh position={[0, -0.14, 0.04]}>
          <octahedronGeometry args={[0.16]} />
          <meshStandardMaterial color="#ffffff" emissive="#25f29a" emissiveIntensity={0.35} />
        </mesh>
      )}
      {props.palette.slice(0, visibleLights).map((color, index) => (
        <LightBeam
          key={`${color}-${index}-${visibleLights}`}
          color={color}
          index={index}
          count={visibleLights}
          generated={generated}
          aimAtEmpties={props.aimAtEmpties}
        />
      ))}
      <PaletteRail palette={props.palette} active={showPalette} />
    </group>
  )
}

export function ChromaRigScene(props: ChromaRigSceneProps) {
  return (
    <Canvas
      className="hero-canvas"
      camera={{ position: [0, 1.1, 5.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.8]}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 3.5, 3.5]} intensity={1.7} color="#d8fff0" />
      <pointLight position={[-3.2, 1.6, 2.6]} intensity={0.8} color={props.palette[0]} />
      <RigPreview {...props} />
    </Canvas>
  )
}
