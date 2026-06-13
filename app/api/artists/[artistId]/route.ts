import { NextResponse } from "next/server";
import { DEMO_ARTISTS, getWorksForArtist } from "@/lib/demoData";

function findArtist(artistId: string) {
  for (const list of Object.values(DEMO_ARTISTS)) {
    const a = list.find((x: any) => x.id === artistId);
    if (a) return a;
  }
  return null;
}

export async function GET(_req: any, { params }: any) {
  const { artistId } = await params;
  const artist = findArtist(artistId);
  if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const works = getWorksForArtist(artistId);
  return NextResponse.json({ artist, works });
}
