import type { Metadata } from "next";
import Link from "next/link";
import { getServerSupabase } from "@/lib/server-supabase";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Digital Toolkits | Money Engine",description:"Practical digital toolkits, planners and resources created around validated search demand.",robots:{index:true,follow:true}};

export default async function ShopPage(){
 const db=getServerSupabase();
 const {data:briefs}=db?await db.from("product_briefs").select("*,opportunities(id,title,niche,score)").eq("status","ready").order("updated_at",{ascending:false}):{data:[] as any[]};
 return <div style={{maxWidth:1100,margin:"20px auto"}}><div className="eyebrow">Money Engine storefront</div><h1>Practical digital toolkits</h1><p className="sub" style={{fontSize:16,maxWidth:700,lineHeight:1.6}}>Focused resources built around validated problems and search demand. Only finished products appear here.</p>{(briefs||[]).length?<div className="grid integration-grid" style={{marginTop:26}}>{(briefs||[]).map((b:any)=><Link href={`/offers/${b.opportunity_id}`} className="card integration" key={b.id}><div className="state">ready</div><h3 style={{fontSize:18,marginTop:8}}>{b.name}</h3><p>{b.promise}</p><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",marginTop:18}}><div className="meta">{b.product_type.replaceAll("_"," ")}</div><strong style={{fontSize:20}}>£{Number(b.price_gbp).toFixed(2)}</strong></div></Link>)}</div>:<section className="card" style={{marginTop:24}}><h2>New products are being prepared</h2><p className="sub">The factory only publishes products after validation and asset checks. Check back shortly.</p></section>}</div>;
}
