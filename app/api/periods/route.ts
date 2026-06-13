import { NextResponse } from "next/server";
import { DEMO_PERIODS } from "@/lib/demoData";
export async function GET() {
  return NextResponse.json(DEMO_PERIODS);
}
