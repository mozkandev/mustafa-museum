"use client";
import { create } from "zustand";

// Store for cross-component navigation state.
// We expose it lazily and only access it from client components to avoid
// SSR/server-component restrictions.
export const useStore = create((set) => ({
  view: "timeline", // "timeline" | "artists" | "gallery"
  selectedPeriod: null,
  selectedArtist: null,
  setView: (v: string) => set({ view: v }),
  selectPeriod: (p: any) => set({ view: "artists", selectedPeriod: p }),
  selectArtist: (a: any) => set({ view: "gallery", selectedArtist: a }),
  goHome: () => set({ view: "timeline", selectedPeriod: null, selectedArtist: null }),
  goBackToArtists: () => set({ view: "artists", selectedArtist: null }),
}));
