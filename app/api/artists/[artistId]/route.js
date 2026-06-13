import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(_req, { params }) {
  const { artistId } = await params;
  const [artist, works] = await Promise.all([
    prisma.artist.findUnique({ where: { id: artistId }, include: { period: true } }),
    prisma.work.findMany({ where: { artistId } }),
  ]);
  if (!artist) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ artist, works });
}
