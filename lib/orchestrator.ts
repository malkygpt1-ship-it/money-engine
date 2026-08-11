export type GateDecision = { allowed: boolean; requiresApproval: boolean; reason: string };

export function evaluateAction(input:{autonomy:"green"|"amber"|"red"; estimatedCostGbp:number; destructive?:boolean; productionCode?:boolean}):GateDecision{
  if(input.destructive || input.productionCode || input.autonomy === "red") return {allowed:false,requiresApproval:true,reason:"Red-gate action"};
  if(input.autonomy === "amber" && input.estimatedCostGbp > 2) return {allowed:false,requiresApproval:true,reason:"Amber job exceeds £2 budget"};
  return {allowed:true,requiresApproval:false,reason:"Within autonomy policy"};
}

export const productionLoop = [
  "discover_demand",
  "score_opportunity",
  "commercial_validation",
  "generate_offer",
  "generate_assets",
  "publish",
  "measure",
  "attribute_revenue",
  "update_scoring_weights",
] as const;
