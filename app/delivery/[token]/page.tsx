import { getServerSupabase } from "@/lib/server-supabase";
import { notFound } from "next/navigation";

export const dynamic="force-dynamic";

export default async function TokenDeliveryPage({params}:{params:Promise<{token:string}>}){
 const {token}=await params; const db=getServerSupabase(); if(!db) notFound();
 const {data:t}=await db.from("delivery_tokens").select("*").eq("token",token).maybeSingle();
 if(!t || new Date(t.expires_at)<new Date()) return <div className="card"><h1>Delivery link expired</h1><p className="sub">This delivery link is invalid or has expired.</p></div>;
 const {data:b}=await db.from("product_briefs").select("*").eq("id",t.product_brief_id).maybeSingle();
 const {data:a}=await db.from("assets").select("*").eq("opportunity_id",t.opportunity_id).eq("type","digital_product").eq("status","ready").order("created_at",{ascending:false}).limit(1).maybeSingle();
 if(!b||!a) return <div className="card"><h1>Product unavailable</h1><p className="sub">The order exists, but its delivery asset is not currently available.</p></div>;
 if(!t.used_at) await db.from("delivery_tokens").update({used_at:new Date().toISOString()}).eq("token",token);
 const hasFile=typeof a.metadata?.file_content==="string";
 return <div style={{maxWidth:900,margin:"30px auto"}}><div className="eyebrow">Secure delivery</div><h1>{b.name}</h1><p className="sub">Purchased access for {t.customer_email||"customer"}. This link expires {new Date(t.expires_at).toLocaleDateString("en-GB")}.</p>{hasFile?<a className="btn primary" href={`/api/delivery/${token}/file`} style={{display:"inline-block",marginTop:18}}>Download {a.metadata?.file_name||"product file"}</a>:null}<section className="card" style={{marginTop:20}}><div className="code" style={{whiteSpace:"pre-wrap",fontFamily:"inherit",lineHeight:1.75}}>{a.metadata?.content_markdown||"Product content unavailable"}</div></section></div>;
}
