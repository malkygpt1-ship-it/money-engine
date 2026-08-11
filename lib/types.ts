export type OpportunityStatus = "discovered" | "scored" | "approved" | "production" | "published" | "paused";

export type Opportunity = {
  id: string;
  title: string;
  niche: string;
  source: string;
  score: number;
  demand: number;
  competition: number;
  commercialIntent: number;
  status: OpportunityStatus;
  product: string;
  price: number;
  monthlySearches: number;
  revenue30d: number;
  traffic30d: number;
  conversionRate: number;
  nextAction: string;
};

export type Agent = {
  id: string;
  name: string;
  role: string;
  status: "running" | "idle" | "attention";
  autonomy: "green" | "amber" | "red";
  lastRun: string;
  output: string;
};
