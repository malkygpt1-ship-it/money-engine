import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/server-supabase";

const itemSchema = z.object({
  sourceKey: z.string().min(1).max(240),
  title: z.string().min(1).max(240),
  niche: z.string().min(1).max(120).default("discovery"),
  source: z.string().min(1).max(80),
  score: z.number().min(0).max(100),
  demand: z.number().min(0).max(100),
  competition: z.number().min(0).max(100),
  commercialIntent: z.number().min(0).max(100).default(50),
  monthlySearches: z.number().int().min(0).default(0),
  providerPayload: z.record(z.unknown()).default({}),
});

const payloadSchema = z.object({ items: z.array(itemSchema).min(1).max(100) });

export async function POST(request: NextRequest) {
  const secret = process.env.MONEY_ENGINE_INGEST_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServerSupabase();
  if (!db) {
    return NextResponse.json({ error: "Persistent store is not configured" }, { status: 503 });
  }

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rows = parsed.data.items.map((item) => ({
    source_key: item.sourceKey,
    title: item.title,
    niche: item.niche,
    source: item.source,
    score: Math.round(item.score),
    demand: Math.round(item.demand),
    competition: Math.round(item.competition),
    commercial_intent: Math.round(item.commercialIntent),
    monthly_searches: item.monthlySearches,
    provider_payload: item.providerPayload,
    status: item.score >= 85 ? "approved" : "scored",
    next_action: item.score >= 85 ? "Queue commercial validation" : "Review score and monetisation fit",
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await db
    .from("opportunities")
    .upsert(rows, { onConflict: "source_key" })
    .select("id, source_key, score, status");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("system_events").insert({
    event_type: "discovery.ingested",
    entity_type: "opportunity_batch",
    severity: "info",
    payload: { count: rows.length, source: rows[0]?.source },
  });

  return NextResponse.json({ ok: true, count: data?.length ?? 0, opportunities: data });
}
