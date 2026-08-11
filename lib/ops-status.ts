import { getServerSupabase, hasPersistentStore } from "@/lib/server-supabase";

export type OpsEvent = {
  id: string;
  type: string;
  severity: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

export async function getOpsStatus() {
  const supabase = getServerSupabase();
  let events: OpsEvent[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("system_events")
      .select("id,event_type,severity,payload,created_at")
      .order("created_at", { ascending: false })
      .limit(8);
    events = (data ?? []).map((e:any) => ({
      id: String(e.id),
      type: e.event_type,
      severity: e.severity,
      createdAt: e.created_at,
      payload: e.payload ?? {},
    }));
  }

  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
  const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE ?? "Local development";
  const environment = process.env.VERCEL_ENV ?? "development";
  const servedUrl = process.env.VERCEL_URL ?? null;

  return {
    system: hasPersistentStore() ? "LIVE" : "DEMO",
    deployment: process.env.VERCEL ? "READY" : "LOCAL",
    environment,
    sha,
    commitMessage,
    servedUrl,
    database: hasPersistentStore() ? "CONNECTED" : "OFFLINE",
    lastActivity: events[0]?.createdAt ?? null,
    events,
  };
}
