import { randomBytes } from "node:crypto";
import { getServerSupabase } from "@/lib/server-supabase";

const STRIPE_API="https://api.stripe.com/v1";

function stripeKey(){
 const key=process.env.STRIPE_SECRET_KEY;
 if(!key) throw new Error("STRIPE_SECRET_KEY is not configured");
 return key;
}

async function stripePost(path:string, body:URLSearchParams, idempotencyKey?:string){
 const headers:Record<string,string>={Authorization:`Bearer ${stripeKey()}`,"Content-Type":"application/x-www-form-urlencoded"};
 if(idempotencyKey) headers["Idempotency-Key"]=idempotencyKey;
 const res=await fetch(`${STRIPE_API}${path}`,{method:"POST",headers,body,cache:"no-store"});
 const json=await res.json();
 if(!res.ok) throw new Error(json?.error?.message||`Stripe ${path} failed`);
 return json;
}

async function stripeGet(path:string){
 const res=await fetch(`${STRIPE_API}${path}`,{headers:{Authorization:`Bearer ${stripeKey()}`},cache:"no-store"});
 const json=await res.json();
 if(!res.ok) throw new Error(json?.error?.message||`Stripe ${path} failed`);
 return json;
}

function mergeMeta(current:any, patch:Record<string,unknown>){return {...(current||{}),...patch};}

export async function ensureStripePaymentLinks(){
 const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
 const {data:briefs,error}=await db.from("product_briefs").select("*").eq("status","ready").order("updated_at",{ascending:true});
 if(error) throw new Error(error.message);
 let created=0,reused=0;
 for(const b of briefs||[]){
  let meta=b.metadata||{};
  if(meta.stripe_payment_link_url&&meta.stripe_payment_link_id&&meta.stripe_price_id&&meta.stripe_product_id){reused++;continue;}

  let productId=meta.stripe_product_id as string|undefined;
  if(!productId){
   const body=new URLSearchParams();
   body.set("name",b.name);
   body.set("description",b.promise||b.deliverable||"Digital product");
   body.set("metadata[opportunity_id]",b.opportunity_id);
   body.set("metadata[product_brief_id]",b.id);
   const product=await stripePost("/products",body,`money-engine-product-${b.id}`);
   productId=product.id;
   meta=mergeMeta(meta,{stripe_product_id:productId});
   await db.from("product_briefs").update({metadata:meta,updated_at:new Date().toISOString()}).eq("id",b.id);
  }

  let priceId=meta.stripe_price_id as string|undefined;
  if(!priceId){
   const pence=Math.round(Number(b.price_gbp)*100);
   const body=new URLSearchParams();
   body.set("currency","gbp"); body.set("unit_amount",String(pence)); body.set("product",productId!);
   body.set("metadata[opportunity_id]",b.opportunity_id); body.set("metadata[product_brief_id]",b.id);
   const price=await stripePost("/prices",body,`money-engine-price-${b.id}-${pence}`);
   priceId=price.id;
   meta=mergeMeta(meta,{stripe_price_id:priceId});
   await db.from("product_briefs").update({metadata:meta,updated_at:new Date().toISOString()}).eq("id",b.id);
  }

  if(!meta.stripe_payment_link_url||!meta.stripe_payment_link_id){
   const body=new URLSearchParams();
   body.set("line_items[0][price]",priceId!); body.set("line_items[0][quantity]","1");
   body.set("metadata[opportunity_id]",b.opportunity_id); body.set("metadata[product_brief_id]",b.id);
   body.set("payment_intent_data[metadata][opportunity_id]",b.opportunity_id);
   body.set("payment_intent_data[metadata][product_brief_id]",b.id);
   const link=await stripePost("/payment_links",body,`money-engine-link-${b.id}-${priceId}`);
   meta=mergeMeta(meta,{stripe_product_id:productId,stripe_price_id:priceId,stripe_payment_link_id:link.id,stripe_payment_link_url:link.url,stripe_catalogued_at:new Date().toISOString()});
   await db.from("product_briefs").update({metadata:meta,updated_at:new Date().toISOString()}).eq("id",b.id);
   await db.from("system_events").insert({event_type:"stripe.payment_link_created",entity_type:"opportunity",entity_id:b.opportunity_id,severity:"info",payload:{product_brief_id:b.id,product:b.name,price_gbp:Number(b.price_gbp),stripe_product_id:productId,stripe_price_id:priceId,stripe_payment_link_id:link.id}});
   created++;
  }
 }
 return {created,reused,ready:briefs?.length||0};
}

function makeToken(){return randomBytes(24).toString("hex");}

export async function reconcileStripePayments(){
 const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
 const {data:briefs,error}=await db.from("product_briefs").select("id,opportunity_id,metadata").eq("status","ready");
 if(error) throw new Error(error.message);
 const byLink=new Map<string,any>();
 for(const b of briefs||[]){const id=b.metadata?.stripe_payment_link_id;if(id) byLink.set(id,b);}
 let startingAfter:string|undefined; let scanned=0,paid=0,newOrders=0,tokens=0;
 for(let page=0;page<5;page++){
  const qs=new URLSearchParams({limit:"100",status:"complete"}); if(startingAfter) qs.set("starting_after",startingAfter);
  const list=await stripeGet(`/checkout/sessions?${qs.toString()}`); const sessions=list.data||[];
  for(const s of sessions){
   scanned++;
   if(s.payment_status!=="paid") continue;
   const briefId=s.metadata?.product_brief_id; const opportunityId=s.metadata?.opportunity_id;
   const mapped=(s.payment_link&&byLink.get(s.payment_link))||null;
   const b=mapped||((briefs||[]).find((x:any)=>x.id===briefId)); if(!b) continue;
   paid++;
   const oid=opportunityId||b.opportunity_id; const bid=briefId||b.id; const amount=Number(s.amount_total||0)/100; const email=s.customer_details?.email||s.customer_email||null;
   const {data:existing}=await db.from("orders").select("id,status,fulfilment_status").eq("external_id",s.id).maybeSingle();
   const {data:order,error:orderError}=await db.from("orders").upsert({opportunity_id:oid,product_brief_id:bid,provider:"stripe",external_id:s.id,customer_email:email,amount_gbp:amount,status:"paid",fulfilment_status:existing?.fulfilment_status||"pending",updated_at:new Date().toISOString(),metadata:{checkout_session:s.id,payment_intent:s.payment_intent,payment_link:s.payment_link,payment_status:s.payment_status}},{onConflict:"external_id"}).select("id,fulfilment_status").single();
   if(orderError) throw new Error(orderError.message); if(!existing) newOrders++;
   await db.from("revenue_events").upsert({opportunity_id:oid,provider:"stripe",external_id:s.payment_intent||s.id,gross_gbp:amount,fee_gbp:0,net_gbp:amount,occurred_at:new Date((s.created||Math.floor(Date.now()/1000))*1000).toISOString(),metadata:{checkout_session:s.id,payment_link:s.payment_link,product_brief_id:bid}},{onConflict:"provider,external_id"});
   const {data:existingToken}=await db.from("delivery_tokens").select("token").eq("order_id",order.id).maybeSingle();
   if(!existingToken){
    const token=makeToken(); const expires=new Date(Date.now()+30*24*60*60*1000).toISOString();
    const {error:tokenError}=await db.from("delivery_tokens").insert({token,order_id:order.id,opportunity_id:oid,product_brief_id:bid,customer_email:email,expires_at:expires});
    if(tokenError) throw new Error(tokenError.message); tokens++;
    await db.from("system_events").insert({event_type:"stripe.payment_reconciled",entity_type:"opportunity",entity_id:oid,severity:"info",payload:{order_id:order.id,checkout_session:s.id,amount_gbp:amount,customer_email:email,delivery_token_created:true}});
   }
  }
  if(!list.has_more||!sessions.length) break; startingAfter=sessions[sessions.length-1].id;
 }
 return {scanned,paid,newOrders,tokens};
}
