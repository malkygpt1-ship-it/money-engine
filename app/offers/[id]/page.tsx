import type { Metadata } from "next";
import { getServerSupabase } from "@/lib/server-supabase";
import { notFound } from "next/navigation";

export const dynamic="force-dynamic";

async function loadOffer(id:string){
 const db=getServerSupabase(); if(!db) return null;
 const {data:o}=await db.from("opportunities").select("*").eq("id",id).single(); if(!o) return null;
 const {data:b}=await db.from("product_briefs").select("*").eq("opportunity_id",id).maybeSingle(); if(!b) return null;
 return {o,b};
}

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params; const offer=await loadOffer(id);
 if(!offer) return {title:"Money Engine product"};
 return {title:`${offer.b.name} | Money Engine`,description:offer.b.promise||offer.b.deliverable||`Practical resource for ${offer.o.title}`,robots:offer.b.status==="ready"?{index:true,follow:true}:{index:false,follow:false}};
}

export default async function OfferPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const offer=await loadOffer(id); if(!offer) notFound();
 const {o,b}=offer; const ready=b.status==="ready";
 return <div style={{maxWidth:780,margin:"30px auto"}}>
  <div className="eyebrow">Money Engine product</div><h1>{b.name}</h1><p className="sub" style={{fontSize:17,lineHeight:1.7}}>{b.promise}</p>
  <section className="card" style={{marginTop:24}}><div className="metric-row"><div className="metric"><small>Format</small><strong>{b.product_type.replaceAll("_"," ")}</strong></div><div className="metric"><small>Price</small><strong>£{Number(b.price_gbp).toFixed(2)}</strong></div><div className="metric"><small>Status</small><strong>{ready?"Ready":"Preparing"}</strong></div><div className="metric"><small>Topic</small><strong>{o.title}</strong></div></div><h2 style={{marginTop:24}}>What you get</h2><p className="sub">{b.deliverable}</p><h2>Who it is for</h2><p className="sub">{b.audience}</p>{ready?<form action="/api/checkout" method="post" style={{marginTop:24}}><input type="hidden" name="productBriefId" value={b.id}/><button className="btn primary" type="submit">Buy securely for £{Number(b.price_gbp).toFixed(2)}</button></form>:<div className="badge" style={{display:"inline-block",marginTop:20}}>Asset generation pending</div>}</section>
 </div>;
}
