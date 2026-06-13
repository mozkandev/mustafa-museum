"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import Timeline from "@/components/Timeline";

const ArtistsView = dynamic(() => import("@/components/ArtistsView"), { ssr: false });
const GalleryView = dynamic(() => import("@/components/GalleryView"), { ssr: false });

export default function Home() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [artistData, setArtistData] = useState<any>(null);
  const view = useStore((s) => s.view);
  const selectedPeriod = useStore((s) => s.selectedPeriod);
  const selectedArtist = useStore((s) => s.selectedArtist);

  useEffect(() => {
    fetch("/api/periods").then((r) => r.json()).then(setPeriods);
  }, []);

  useEffect(() => {
    if (selectedArtist) {
      fetch(`/api/artists/${selectedArtist.id}`).then((r) => r.json()).then(setArtistData);
    } else {
      setArtistData(null);
    }
  }, [selectedArtist]);

  if (view === "timeline" || !view) {
    return periods.length > 0 ? <Timeline periods={periods} /> : <div className="h-screen flex items-center justify-center bg-[#0a0a14] text-white">Loading…</div>;
  }
  if (view === "artists" && selectedPeriod) {
    return <ArtistsView period={selectedPeriod} />;
  }
  if (view === "gallery" && selectedArtist && artistData) {
    return <GalleryView artist={artistData.artist} works={artistData.works} />;
  }
  return <div className="h-screen flex items-center justify-center bg-[#0a0a14] text-white">Loading…</div>;
}
