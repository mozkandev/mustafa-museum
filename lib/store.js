"use client";
import { create } from "zustand";

export const useStore = create((set) => ({
  view: "timeline", // "timeline" | "artists" | "gallery"
  selectedPeriod: null,
  selectedArtist: null,
  setView: (v) => set({ view: v }),
  selectPeriod: (p) => set({ selectedPeriod: p, view: "artists" }),
  selectArtist: (a) => set({ selectedArtist: a, view: "gallery" }),
  goHome: () => set({ view: "timeline", selectedPeriod: null, selectedArtist: null }),
  backToArtists: () => set({ view: "artists", selectedArtist: null }),
}));
