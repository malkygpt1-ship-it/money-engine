import { NextResponse } from "next/server";
import { opportunities } from "@/lib/demo-data";
export async function GET(){return NextResponse.json({mode:"demo",opportunities})}
