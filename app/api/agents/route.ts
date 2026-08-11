import { NextResponse } from "next/server";
import { agents } from "@/lib/demo-data";
export async function GET(){return NextResponse.json({mode:"demo",agents})}
