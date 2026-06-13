"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import Timeline from "@/components/Timeline";

const ArtistsView = dynamic(() => import("@/components/ArtistsView"), { ssr: false, loading: () => <Loading /> });
const GalleryView = dynamic(() => import("@/components/GalleryView"), { ssr: false, loading: () => <Loading /> });

function Loading() {
  return <div className="h-screen flex items-center justify-center bg-[#0a0a14] text-white">Loading…</div>;
}

export default function Home() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [artistData, setArtistData] = useState<any>(null);
  const [hydrated, setHydrated] = useState(false);

  const view = useStore((s: any) => s.view);
  const selectedPeriod = useStore((s: any) => s.selectedPeriod);
  const selectedArtist = useStore((s: any) => s.selectedArtist);

  // Wait for client hydration before rendering to avoid zustand SSR issues
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    fetch("/api/periods")
      .then((r) => r.json())
      .then((data) => setPeriods(data))
      .catch((e) => console.error("Failed to load periods:", e));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (selectedArtist) {
      fetch(`/api/artists/${selectedArtist.id}`)
        .then((r) => r.json())
        .then(setArtistData)
        .catch((e) => console.error("Failed to load artist:", e));
    } else {
      setArtistData(null);
    }
  }, [selectedArtist, hydrated]);

  if (!hydrated) return <Loading />;
  if (view === "artists" && selectedPeriod) return <ArtistsView period={selectedPeriod} />;
  if (view === "gallery" && selectedArtist && artistData) {
    return <GalleryView artist={artistData.artist} works={artistData.works} />;
  }
  // Default: timeline
  if (periods.length === 0) return <Loading />;
  return <Timeline periods={periods} />;
}
