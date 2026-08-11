import { getServerSupabase } from "@/lib/server-supabase";

const STRIPE_API="https://api.stripe.com/v1";

function stripeKey(){const key=process.env.STRIPE_SECRET_KEY;if(!key) throw new Error("STRIPE_SECRET_KEY is not configured");return key;}

async function stripeGet(path:string){
 const res=await fetch(`${STRIPE_API}${path}`,{headers:{Authorization:`Bearer ${stripeKey()}`},cache:"no-store"});
 const json=await res.json(); if(!res.ok) throw new Error(json?.error?.message||`Stripe ${path} failed`); return json;
}

export async function reconcileStripeFees(){
 const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
 const {data:events,error}=await db.from("revenue_events").select("id,external_id,gross_gbp,fee_gbp,metadata").eq("provider","stripe").order("occurred_at",{ascending:false}).limit(100);
 if(error) throw new Error(error.message);
 let checked=0,updated=0;
 for(const e of events||[]){
  if(!String(e.external_id||"").startsWith("pi_")) continue;
  checked++;
  const pi=await stripeGet(`/payment_intents/${encodeURIComponent(e.external_id)}?expand%5B%5D=latest_charge.balance_transaction`);
  const bt=pi?.latest_charge?.balance_transaction;
  if(!bt||typeof bt!=="object") continue;
  const gross=Number(bt.amount??Math.round(Number(e.gross_gbp||0)*100))/100;
  const fee=Number(bt.fee||0)/100;
  const net=Number(bt.net??(Number(bt.amount||0)-Number(bt.fee||0)))/100;
  const {error:updateError}=await db.from("revenue_events").update({gross_gbp:gross,fee_gbp:fee,net_gbp:net,metadata:{...(e.metadata||{}),balance_transaction:bt.id,fee_reconciled:true}}).eq("id",e.id);
  if(updateError) throw new Error(updateError.message); updated++;
 }
 return {checked,updated};
}
