import { NextResponse } from "next/server";
import { DEMO_ARTISTS } from "@/lib/demoData";
export async function GET(_req: any, { params }: any) {
  const { periodId } = await params;
  return NextResponse.json(DEMO_ARTISTS[periodId] || []);
}
