import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(_req, { params }) {
  const { periodId } = await params;
  const artists = await prisma.artist.findMany({
    where: { periodId },
    orderBy: { birthYear: "asc" },
    include: { _count: { select: { works: true } } },
  });
  return NextResponse.json(artists);
}
