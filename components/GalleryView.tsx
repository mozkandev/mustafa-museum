"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, useTexture, Environment, Text, SpotLight } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping, Vignette, SMAA } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { gsap } from "gsap";
import { useStore } from "@/lib/store";

function WalkControls() {
  const { camera } = useThree();
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    const onKeyDown = (e) => { keys.current[e.code] = true; };
    const onKeyUp = (e) => { keys.current[e.code] = false; };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const speed = 5;
    direction.current.z = Number(keys.current["KeyW"] || keys.current["ArrowUp"]) - Number(keys.current["KeyS"] || keys.current["ArrowDown"]);
    direction.current.x = Number(keys.current["KeyD"] || keys.current["ArrowRight"]) - Number(keys.current["KeyA"] || keys.current["ArrowLeft"]);
    direction.current.normalize();
    velocity.current.x = direction.current.x * speed * delta;
    velocity.current.z = direction.current.z * speed * delta;
    camera.translateX(velocity.current.x);
    camera.translateZ(-velocity.current.z);
  });
  return <PointerLockControls />;
}

function Painting({ work, position, rotation, onClick }: any) {
  const tex: any = useTexture(work.thumbUrl || work.imageUrl);
  const frameRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
    }
  }, [tex]);

  useEffect(() => {
    if (hovered && frameRef.current) {
      gsap.to(frameRef.current.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.2 });
    } else if (frameRef.current) {
      gsap.to(frameRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
    }
  }, [hovered]);

  const aspect = work.width && work.height ? work.width / work.height : 1.5;
  const w = Math.min(2.5, 1.8 * Math.sqrt(aspect));
  const h = w / aspect;

  return (
    <group ref={frameRef} position={position} rotation={rotation} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Frame (gold) */}
      <mesh>
        <boxGeometry args={[w + 0.2, h + 0.2, 0.1]} />
        <meshStandardMaterial color="#b8860b" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Inner frame (slight depth) */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[w + 0.08, h + 0.08, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Canvas */}
      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.7} metalness={0} toneMapped={true} />
      </mesh>
      {/* Title plaque */}
      <mesh position={[0, -h/2 - 0.2, 0.05]}>
        <planeGeometry args={[w, 0.15]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <Text position={[0, -h/2 - 0.2, 0.06]} fontSize={0.06} color="#d4af37" anchorX="center" anchorY="middle" maxWidth={w - 0.1}>
        {work.title}
      </Text>
      {work.year && (
        <Text position={[0, -h/2 - 0.28, 0.06]} fontSize={0.04} color="#a8a29e" anchorX="center" anchorY="middle">
          {work.year} · {work.medium || "Oil on canvas"}
        </Text>
      )}
    </group>
  );
}

function GalleryRoom({ works, onPaintingClick }) {
  // 4 walls forming a room (X-shape, like a real museum room)
  // Wall 1: -Z, Wall 2: +X, Wall 3: +Z, Wall 4: -X
  // Each wall has 2-3 paintings
  const walls = useRef([]);

  // Distribute works across walls
  const wallLayout = [[], [], [], []];
  works.forEach((w, i) => wallLayout[i % 4].push(w));

  return (
    <group>
      {/* Floor — marble */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} metalness={0.05} />
      </mesh>
      {/* Floor pattern (grid lines) */}
      <gridHelper args={[30, 30, "#d4c8a8", "#d4c8a8"]} position={[0, 0.001, 0]} />
      {/* Ceiling */}
      <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.8} />
      </mesh>

      {/* Walls — warm cream color */}
      {/* Wall -Z (back) */}
      <mesh position={[0, 3, -10]} receiveShadow>
        <boxGeometry args={[20, 6, 0.2]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.85} />
      </mesh>
      {/* Wall +X (right) */}
      <mesh position={[10, 3, 0]} rotation={[0, -Math.PI/2, 0]} receiveShadow>
        <boxGeometry args={[20, 6, 0.2]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.85} />
      </mesh>
      {/* Wall -X (left) */}
      <mesh position={[-10, 3, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <boxGeometry args={[20, 6, 0.2]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.85} />
      </mesh>
      {/* Wall +Z (front) */}
      <mesh position={[0, 3, 10]} rotation={[0, Math.PI, 0]} receiveShadow>
        <boxGeometry args={[20, 6, 0.2]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.85} />
      </mesh>

      {/* Wall #1 (-Z, facing +Z direction) */}
      {wallLayout[0].map((w, i) => {
        const offset = (i - (wallLayout[0].length-1)/2) * 4.5;
        return <Painting key={`w1-${i}`} work={w} position={[offset, 2.5, -9.9]} rotation={[0, 0, 0]} onClick={() => onPaintingClick(w)} />;
      })}
      {/* Wall #2 (+X, facing -X direction) */}
      {wallLayout[1].map((w, i) => {
        const offset = (i - (wallLayout[1].length-1)/2) * 4.5;
        return <Painting key={`w2-${i}`} work={w} position={[9.9, 2.5, offset]} rotation={[0, -Math.PI/2, 0]} onClick={() => onPaintingClick(w)} />;
      })}
      {/* Wall #3 (+Z, facing -Z direction) */}
      {wallLayout[2].map((w, i) => {
        const offset = (i - (wallLayout[2].length-1)/2) * 4.5;
        return <Painting key={`w3-${i}`} work={w} position={[offset, 2.5, 9.9]} rotation={[0, Math.PI, 0]} onClick={() => onPaintingClick(w)} />;
      })}
      {/* Wall #4 (-X, facing +X direction) */}
      {wallLayout[3].map((w, i) => {
        const offset = (i - (wallLayout[3].length-1)/2) * 4.5;
        return <Painting key={`w4-${i}`} work={w} position={[-9.9, 2.5, offset]} rotation={[0, Math.PI/2, 0]} onClick={() => onPaintingClick(w)} />;
      })}

      {/* Spotlights over each painting (museum-style track lights) */}
      {wallLayout.flat().map((w, i) => {
        // Approximate position: we don't track per-wall, so use a generic overhead light pattern
        return null;
      })}

      {/* Central skylight (overhead illumination) */}
      <pointLight position={[0, 5.5, 0]} intensity={0.4} color="#fff5e0" />
      {/* Ambient museum light */}
      <ambientLight intensity={0.25} color="#fff8e7" />

      {/* Decorative elements: benches */}
      <mesh position={[0, 0.4, 4]} castShadow>
        <boxGeometry args={[3, 0.4, 0.8]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.15, 4]}>
        <boxGeometry args={[3, 0.3, 0.8]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.8, 4]}>
        <boxGeometry args={[3, 0.05, 0.8]} />
        <meshStandardMaterial color="#6a4a2a" roughness={0.5} metalness={0.3} />
      </mesh>

      <mesh position={[0, 0.4, -4]} castShadow>
        <boxGeometry args={[3, 0.4, 0.8]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.15, -4]}>
        <boxGeometry args={[3, 0.3, 0.8]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.8, -4]}>
        <boxGeometry args={[3, 0.05, 0.8]} />
        <meshStandardMaterial color="#6a4a2a" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}

function Placard({ work, position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#000" opacity={0.85} transparent />
      </mesh>
      <Text position={[0, 0.2, 0.01]} fontSize={0.08} color="#d4af37" anchorX="center" anchorY="middle" maxWidth={1.1}>
        {work.title}
      </Text>
      <Text position={[0, 0, 0.01]} fontSize={0.05} color="#e8e0d0" anchorX="center" anchorY="middle" maxWidth={1.1}>
        {work.year || ""}
      </Text>
      <Text position={[0, -0.2, 0.01]} fontSize={0.04} color="#a8a29e" anchorX="center" anchorY="middle" maxWidth={1.1}>
        {work.medium || ""}
      </Text>
    </group>
  );
}

export default function GalleryView({ artist, works }) {
  const [selectedWork, setSelectedWork] = useState(null);
  const backToArtists = useStore(s => s.backToArtists);
  const [clicked, setClicked] = useState(false);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <button onClick={backToArtists} className="pointer-events-auto text-amber-200/80 hover:text-amber-200 text-sm mb-2 font-mono">← back to artists</button>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">{artist.name}</h1>
          <p className="text-white/60 text-xs font-mono mt-1">{artist.birthYear}–{artist.deathYear} · {artist.nationality} · {artist.movements}</p>
        </div>
        <div className="text-amber-200/60 text-sm font-mono pointer-events-auto">
          {works.length} works · click to lock cursor · WASD to walk
        </div>
      </div>

      {/* Click-to-start overlay */}
      {!clicked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto cursor-pointer" onClick={() => setClicked(true)}>
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🏛️</div>
            <h2 className="text-3xl font-bold mb-2">Enter the Gallery</h2>
            <p className="text-white/70 text-sm">Click to lock cursor and walk</p>
            <p className="text-white/50 text-xs mt-2 font-mono">WASD / arrows to move · ESC to release · scroll to look</p>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, outputColorSpace: THREE.SRGBColorSpace }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; }}
      >
        <color attach="background" args={["#000"]} />
        <fog attach="fog" args={["#000", 12, 30]} />

        <Suspense fallback={null}>
          <Environment preset="apartment" />
          <GalleryRoom works={works} onPaintingClick={setSelectedWork} />
        </Suspense>

        {clicked && <WalkControls />}

        <EffectComposer multisampling={0}>
          <SMAA />
          <Bloom intensity={0.15} luminanceThreshold={0.9} luminanceSmoothing={0.4} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette eskil={false} offset={0.3} darkness={0.6} />
        </EffectComposer>
      </Canvas>

      {/* Placard */}
      {selectedWork && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 max-w-md w-full px-4">
          <div className="bg-black/80 backdrop-blur border border-amber-500/30 rounded-lg p-4 text-white">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-amber-300">{selectedWork.title}</h3>
              <button onClick={() => setSelectedWork(null)} className="text-white/60 hover:text-white text-sm">×</button>
            </div>
            <p className="text-white/70 text-xs font-mono mb-2">{selectedWork.year} · {selectedWork.medium}</p>
            <p className="text-white/80 text-sm">{selectedWork.description || "From Wikimedia Commons."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
