import { getServerSupabase } from "@/lib/server-supabase";
import { ensureStripePaymentLinks, reconcileStripePayments } from "@/lib/stripe-commerce";

async function writeEvent(type:string,payload:Record<string,unknown>){
 const db=getServerSupabase(); if(!db) return;
 await db.from("system_events").insert({event_type:type,entity_type:"agent",entity_id:"payments",severity:"info",payload});
}

export async function runStripeWorker(){
 const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
 await writeEvent("agent.started",{agent:"payments"});
 try{
  const catalogue=await ensureStripePaymentLinks();
  const reconciliation=await reconcileStripePayments();
  const output={catalogue,reconciliation};
  await db.from("agent_runs").insert({agent_id:"payments",opportunity_id:null,autonomy:"green",action:"stripe_catalogue_and_reconciliation",status:"completed",output});
  await writeEvent("agent.completed",{agent:"payments",...output});
  return output;
 }catch(error){
  const message=error instanceof Error?error.message:"Stripe worker failed";
  await db.from("agent_runs").insert({agent_id:"payments",opportunity_id:null,autonomy:"green",action:"stripe_catalogue_and_reconciliation",status:"failed",output:{error:message}});
  await db.from("system_events").insert({event_type:"agent.failed",entity_type:"agent",entity_id:"payments",severity:"error",payload:{agent:"payments",error:message}});
  throw error;
 }
}
