import { opportunities as demoOpportunities } from "@/lib/demo-data";
import type { Opportunity, OpportunityStatus } from "@/lib/types";
import { getServerSupabase } from "@/lib/server-supabase";

type OpportunityRow = {
  id: string;
  title: string;
  niche: string;
  source: string;
  score: number;
  demand: number;
  competition: number;
  commercial_intent: number;
  status: OpportunityStatus;
  product_name: string | null;
  product_price: number | null;
  monthly_searches: number | null;
  revenue_30d: number | null;
  traffic_30d: number | null;
  conversion_rate: number | null;
  next_action: string | null;
};

function mapRow(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    title: row.title,
    niche: row.niche,
    source: row.source,
    score: row.score,
    demand: row.demand,
    competition: row.competition,
    commercialIntent: row.commercial_intent,
    status: row.status,
    product: row.product_name ?? "Unassigned",
    price: Number(row.product_price ?? 0),
    monthlySearches: row.monthly_searches ?? 0,
    revenue30d: Number(row.revenue_30d ?? 0),
    traffic30d: row.traffic_30d ?? 0,
    conversionRate: Number(row.conversion_rate ?? 0),
    nextAction: row.next_action ?? "Review opportunity",
  };
}

export async function listOpportunities(): Promise<Opportunity[]> {
  const db = getServerSupabase();
  if (!db) return demoOpportunities;

  const { data, error } = await db
    .from("opportunities")
    .select("*")
    .order("score", { ascending: false });

  if (error) {
    console.error("Failed to load opportunities", error.message);
    return demoOpportunities;
  }

  return (data as OpportunityRow[]).map(mapRow);
}

export async function updateOpportunityStatus(id: string, status: OpportunityStatus) {
  const db = getServerSupabase();
  if (!db) return { demo: true };

  const { error } = await db
    .from("opportunities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await db.from("system_events").insert({
    event_type: "opportunity.status_changed",
    entity_type: "opportunity",
    entity_id: id,
    severity: "info",
    payload: { status },
  });

  return { demo: false };
}
