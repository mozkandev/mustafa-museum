"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, RoundedBox, useTexture, Environment, ContactShadows, Float } from "@react-three/drei";
import { useStore } from "@/lib/store";
import { gsap } from "gsap";

function ArtistCard({ artist, position, index, onClick }: { artist: any; position: [number, number, number]; index: number; onClick: () => void }) {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const tex: any = artist.portrait ? useTexture(artist.portrait) : null;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.08;
    }
  });

  useEffect(() => {
    if (hovered && meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3, ease: "power2.out" });
      gsap.to(meshRef.current.position, { y: position[1] + 0.2, duration: 0.3, ease: "power2.out" });
    } else if (meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(meshRef.current.position, { y: position[1], duration: 0.3, ease: "power2.out" });
    }
  }, [hovered, position]);

  return (
    <group ref={meshRef} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <RoundedBox args={[2.4, 3, 0.2]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={hovered ? "#fde68a" : "#0c0a09"} metalness={0.3} roughness={0.6} />
      </RoundedBox>
      {/* Portrait */}
      {tex ? (
        <mesh position={[0, 0.5, 0.11]}>
          <planeGeometry args={[2.1, 1.6]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      ) : (
        <mesh position={[0, 0.5, 0.11]}>
          <planeGeometry args={[2.1, 1.6]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>
      )}
      {/* Name plate */}
      <mesh position={[0, -0.9, 0.11]}>
        <planeGeometry args={[2.2, 0.9]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      <Text position={[0, -0.7, 0.12]} fontSize={0.18} color="#fde68a" anchorX="center" anchorY="middle" maxWidth={2} textAlign="center" font="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.woff">
        {artist.name}
      </Text>
      <Text position={[0, -1.0, 0.12]} fontSize={0.1} color="#a8a29e" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.woff">
        {artist.birthYear}{artist.deathYear ? `–${artist.deathYear}` : ""}
      </Text>
      <Text position={[0, -1.2, 0.12]} fontSize={0.08} color="#78716c" anchorX="center" anchorY="middle">
        {artist.nationality}
      </Text>
    </group>
  );
}

export default function ArtistsView({ period }: { period: any }) {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const selectArtist = useStore((s: any) => s.selectArtist);
  const backToTimeline = useStore((s: any) => s.goHome);

  useEffect(() => {
    fetch(`/api/periods/${period.id}/artists`)
      .then(r => r.json())
      .then(d => { setArtists(d); setLoading(false); });
  }, [period]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#0a0a14] to-[#0d0815] overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <button onClick={backToTimeline} className="pointer-events-auto text-amber-200/80 hover:text-amber-200 text-sm mb-2 font-mono">← back to timeline</button>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">{period.name}</h1>
          <p className="text-white/50 text-xs font-mono mt-1">{period.startYear}–{period.endYear} · {period.region}</p>
        </div>
        <div className="text-amber-200/60 text-sm font-mono pointer-events-auto">{artists.length} artists</div>
      </div>

      {/* 3D canvas */}
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]} shadows>
        <Suspense fallback={<Text position={[0, 0, 0]} fontSize={0.4} color="#a8a29e" anchorX="center">Loading…</Text>}>
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
        </Suspense>
      </Canvas>
    </div>
  );
}
