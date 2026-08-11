import { getServerSupabase } from "@/lib/server-supabase";

export const dynamic="force-dynamic";

async function retrieveSession(id:string){
 const stripe=process.env.STRIPE_SECRET_KEY; if(!stripe) return null;
 const res=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${stripe}`},cache:"no-store"});
 if(!res.ok) return null; return res.json();
}

export default async function DeliveryPage({searchParams}:{searchParams:Promise<{session_id?:string}>}){
 const {session_id}=await searchParams; if(!session_id) return <div className="card"><h1>Missing checkout session</h1></div>;
 const session=await retrieveSession(session_id); const db=getServerSupabase();
 if(!session||!db||session.payment_status!=="paid") return <div className="card"><h1>Payment not verified</h1><p className="sub">The product will only be released after Stripe confirms payment.</p></div>;
 const opportunityId=session.metadata?.opportunity_id; const briefId=session.metadata?.product_brief_id;
 const {data:b}=await db.from("product_briefs").select("*").eq("id",briefId).single();
 const {data:a}=await db.from("assets").select("*").eq("opportunity_id",opportunityId).eq("type","digital_product").eq("status","ready").order("created_at",{ascending:false}).limit(1).maybeSingle();
 if(!b||!a) return <div className="card"><h1>Product is being prepared</h1><p className="sub">Payment is verified, but the delivery asset is not ready yet. The order is safely recorded.</p></div>;
 const email=session.customer_details?.email||null; const amount=Number(session.amount_total||0)/100;
 await db.from("orders").upsert({opportunity_id:opportunityId,product_brief_id:briefId,provider:"stripe",external_id:session.id,customer_email:email,amount_gbp:amount,status:"paid",fulfilment_status:"fulfilled",updated_at:new Date().toISOString(),metadata:{payment_status:session.payment_status}},{onConflict:"external_id"});
 await db.from("revenue_events").upsert({opportunity_id:opportunityId,provider:"stripe",external_id:session.payment_intent||session.id,gross_gbp:amount,fee_gbp:0,occurred_at:new Date().toISOString(),metadata:{checkout_session:session.id}},{onConflict:"external_id"});
 await db.from("system_events").insert({event_type:"fulfilment.completed",entity_type:"opportunity",entity_id:opportunityId,severity:"info",payload:{product:b.name,amount,email}});
 return <div style={{maxWidth:900,margin:"30px auto"}}><div className="eyebrow">Payment verified · delivered</div><h1>{b.name}</h1><p className="sub">Your purchase is unlocked below.</p><section className="card" style={{marginTop:20}}><div className="code" style={{whiteSpace:"pre-wrap",fontFamily:"inherit",lineHeight:1.75}}>{a.metadata?.content_markdown||"Product content unavailable"}</div></section></div>;
}
