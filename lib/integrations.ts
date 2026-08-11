export type Integration = {
  id: string;
  name: string;
  purpose: string;
  state: "ready" | "stub" | "connected";
  autonomousActions: string[];
};

export const integrations: Integration[] = [
  { id: "vidiq", name: "vidIQ", purpose: "Demand + keyword intelligence", state: "ready", autonomousActions: ["keyword research", "rising keyword scans", "YouTube opportunity discovery"] },
  { id: "canva", name: "Canva", purpose: "Creative production", state: "stub", autonomousActions: ["thumbnail briefs", "template-based creatives", "product covers"] },
  { id: "heygen", name: "HeyGen", purpose: "Presenter-led video production", state: "stub", autonomousActions: ["script-to-video jobs", "render status tracking"] },
  { id: "stripe", name: "Stripe", purpose: "Products, prices + revenue", state: "stub", autonomousActions: ["create product drafts", "create checkout links", "sync sales metrics"] },
  { id: "github", name: "GitHub", purpose: "Code + controlled publishing", state: "connected", autonomousActions: ["branch/commit proposals", "PR creation", "deployment gates"] },
  { id: "gmail", name: "Gmail", purpose: "Operational communications", state: "stub", autonomousActions: ["classify inbound mail", "draft replies", "surface revenue-related mail"] },
  { id: "notion", name: "Notion", purpose: "SOP + business knowledge", state: "stub", autonomousActions: ["read operating rules", "log experiments", "capture decisions"] },
  { id: "supabase", name: "Supabase", purpose: "Business state + event ledger", state: "ready", autonomousActions: ["persist opportunities", "log agent runs", "store metrics"] },
];
