import { getServerSupabase } from "@/lib/server-supabase";
import { notFound } from "next/navigation";

export const dynamic="force-dynamic";

export default async function OfferPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const db=getServerSupabase(); if(!db) notFound();
 const {data:o}=await db.from("opportunities").select("*").eq("id",id).single(); if(!o) notFound();
 const {data:b}=await db.from("product_briefs").select("*").eq("opportunity_id",id).maybeSingle(); if(!b) notFound();
 const ready=b.status==="ready";
 return <div style={{maxWidth:780,margin:"30px auto"}}>
  <div className="eyebrow">Money Engine product</div><h1>{b.name}</h1><p className="sub" style={{fontSize:17,lineHeight:1.7}}>{b.promise}</p>
  <section className="card" style={{marginTop:24}}><div className="metric-row"><div className="metric"><small>Format</small><strong>{b.product_type.replaceAll("_"," ")}</strong></div><div className="metric"><small>Price</small><strong>£{Number(b.price_gbp).toFixed(2)}</strong></div><div className="metric"><small>Status</small><strong>{ready?"Ready":"Preparing"}</strong></div><div className="metric"><small>Topic</small><strong>{o.title}</strong></div></div><h2 style={{marginTop:24}}>What you get</h2><p className="sub">{b.deliverable}</p><h2>Who it is for</h2><p className="sub">{b.audience}</p>{ready?<form action="/api/checkout" method="post" style={{marginTop:24}}><input type="hidden" name="productBriefId" value={b.id}/><button className="btn primary" type="submit">Buy securely for £{Number(b.price_gbp).toFixed(2)}</button></form>:<div className="badge" style={{display:"inline-block",marginTop:20}}>Asset generation pending</div>}</section>
 </div>;
}
