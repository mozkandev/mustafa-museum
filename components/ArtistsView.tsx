"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Text, RoundedBox, Environment, ContactShadows, Float } from "@react-three/drei";
import { useStore } from "@/lib/store";
import { gsap } from "gsap";
import * as THREE from "three";

function ArtistCard({ artist, position, index, onClick }: { artist: any; position: [number, number, number]; index: number; onClick: () => void }) {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [texError, setTexError] = useState(false);

  // Manually load the texture with a hard timeout — no Suspense, no crash
  useEffect(() => {
    if (!artist.portrait) return;
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) setTexError(true);
    }, 8000);
    loader.load(
      artist.portrait,
      (t) => {
        if (cancelled) return;
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        setTexture(t);
      },
      undefined,
      () => {
        if (!cancelled) setTexError(true);
      }
    );
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [artist.portrait]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(t * 0.6 + index) * 0.1;
    }
  });

  useEffect(() => {
    if (!meshRef.current) return;
    const target = hovered ? 1.08 : 1.0;
    gsap.to(meshRef.current.scale, { x: target, y: target, z: target, duration: 0.3, ease: "power2.out" });
  }, [hovered]);

  return (
    <group ref={meshRef} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <RoundedBox args={[2.2, 2.6, 0.15]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial color={hovered ? "#1a1a2e" : "#0f0f1a"} metalness={0.4} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.5, 0.11]}>
        <planeGeometry args={[1.8, 1.4]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color={texError ? "#1a1a2e" : "#2a2a3e"} />
        )}
      </mesh>
      <mesh position={[0, -0.9, 0.11]}>
        <planeGeometry args={[2.0, 0.5]} />
        <meshBasicMaterial color="#0a0a14" />
      </mesh>
      <Text position={[0, -0.7, 0.12]} fontSize={0.18} color="#fde68a" anchorX="center" anchorY="middle" maxWidth={2} textAlign="center">
        {artist.name}
      </Text>
      <Text position={[0, -1.0, 0.12]} fontSize={0.1} color="#a8a29e" anchorX="center" anchorY="middle">
        {artist.birthYear}–{artist.deathYear}
      </Text>
      <Text position={[0, -1.2, 0.12]} fontSize={0.08} color="#78716c" anchorX="center" anchorY="middle">
        {artist.nationality}
      </Text>
    </group>
  );
}

function ArtistsGridFallback({ artists, onPick }: { artists: any[]; onPick: (a: any) => void }) {
  return (
    <div className="absolute inset-0 overflow-y-auto p-8 pt-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {artists.map((a) => (
          <button
            key={a.id}
            onClick={() => onPick(a)}
            className="group bg-[#0f0f1a] hover:bg-[#1a1a2e] border border-amber-200/20 hover:border-amber-200/60 rounded-xl p-5 text-left transition-all"
          >
            <div className="aspect-square bg-[#1a1a2e] rounded-lg mb-3 overflow-hidden">
              {a.portrait && (
                <img src={a.portrait} alt={a.name} className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
            <h3 className="text-amber-100 font-bold text-lg">{a.name}</h3>
            <p className="text-amber-200/50 text-sm font-mono">{a.birthYear}–{a.deathYear} · {a.nationality}</p>
            <p className="text-stone-400 text-xs mt-2 line-clamp-3">{a.summary}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ArtistsView({ period }: { period: any }) {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [webglOk, setWebglOk] = useState(true);
  const selectArtist = useStore((s: any) => s.selectArtist);
  const backToTimeline = useStore((s: any) => s.goHome);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
      if (!gl) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }

    fetch(`/api/periods/${period.id}/artists`)
      .then((r) => r.json())
      .then((d) => {
        setArtists(d);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load artists", e);
        setLoading(false);
      });
  }, [period.id]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#0a0a14] to-[#0d0815] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <button onClick={backToTimeline} className="pointer-events-auto text-amber-200/80 hover:text-amber-200 text-sm mb-2 font-mono">← back to timeline</button>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">{period.name}</h1>
          <p className="text-white/50 text-xs font-mono mt-1">{period.startYear}–{period.endYear} · {period.region}</p>
        </div>
        <div className="text-amber-200/60 text-sm font-mono pointer-events-auto">{artists.length} artists</div>
      </div>

      {webglOk ? (
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]} shadows>
          <color attach="background" args={["#0a0a14"]} />
          <fog attach="fog" args={["#0a0a14", 10, 25]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
          <Environment preset="warehouse" />
          {loading ? (
            <Text position={[0, 0, 0]} fontSize={0.4} color="#a8a29e" anchorX="center">Loading artists…</Text>
          ) : (
            artists.map((a, i) => {
              const cols = Math.min(4, artists.length);
              const col = i % cols;
              const row = Math.floor(i / cols);
              const x = (col - (cols-1)/2) * 2.8;
              const y = -(row) * 4.2 + 1;
              return (
                <Float key={a.id} speed={1.5} rotationIntensity={0.05} floatIntensity={0.3}>
                  <ArtistCard artist={a} position={[x, y, 0]} index={i} onClick={() => selectArtist(a)} />
                </Float>
              );
            })
          )}
          <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        </Canvas>
      ) : loading ? (
        <div className="absolute inset-0 flex items-center justify-center text-amber-200/60">Loading artists…</div>
      ) : (
        <ArtistsGridFallback artists={artists} onPick={selectArtist} />
      )}
    </div>
  );
}
