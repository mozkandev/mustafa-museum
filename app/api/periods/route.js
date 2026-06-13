import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET() {
  const periods = await prisma.period.findMany({
    orderBy: { startYear: "asc" },
    include: { _count: { select: { artists: true } } },
  });
  return NextResponse.json(periods);
}
