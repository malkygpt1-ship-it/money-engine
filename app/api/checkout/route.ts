import { getServerSupabase } from "@/lib/server-supabase";

export async function POST(req:Request){
 const stripe=process.env.STRIPE_SECRET_KEY; if(!stripe) return Response.json({error:"Stripe not configured"},{status:503});
 const db=getServerSupabase(); if(!db) return Response.json({error:"Database unavailable"},{status:503});
 const form=await req.formData(); const productBriefId=String(form.get("productBriefId")||"");
 const {data:b,error}=await db.from("product_briefs").select("*,opportunities(id,title)").eq("id",productBriefId).single();
 if(error||!b) return Response.json({error:"Product not found"},{status:404});
 if(b.status!=="ready") return Response.json({error:"Product is not ready for sale"},{status:409});
 const origin=new URL(req.url).origin;
 const body=new URLSearchParams();
 body.set("mode","payment");
 body.set("success_url",`${origin}/delivery?session_id={CHECKOUT_SESSION_ID}`);
 body.set("cancel_url",`${origin}/offers/${b.opportunity_id}`);
 body.set("client_reference_id",b.opportunity_id);
 body.set("line_items[0][quantity]","1");
 body.set("line_items[0][price_data][currency]","gbp");
 body.set("line_items[0][price_data][unit_amount]",String(Math.round(Number(b.price_gbp)*100)));
 body.set("line_items[0][price_data][product_data][name]",b.name);
 body.set("line_items[0][price_data][product_data][description]",b.promise||b.deliverable||"Digital product");
 body.set("metadata[opportunity_id]",b.opportunity_id);
 body.set("metadata[product_brief_id]",b.id);
 const res=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${stripe}`,"Content-Type":"application/x-www-form-urlencoded"},body});
 const session=await res.json(); if(!res.ok||!session.url) return Response.json({error:session.error?.message||"Stripe checkout failed"},{status:502});
 await db.from("orders").upsert({opportunity_id:b.opportunity_id,product_brief_id:b.id,provider:"stripe",external_id:session.id,amount_gbp:Number(b.price_gbp),status:"pending",fulfilment_status:"pending",metadata:{checkout_url:session.url}},{onConflict:"external_id"});
 await db.from("system_events").insert({event_type:"checkout.created",entity_type:"opportunity",entity_id:b.opportunity_id,severity:"info",payload:{product:b.name,amount:Number(b.price_gbp)}});
 return Response.redirect(session.url,303);
}
