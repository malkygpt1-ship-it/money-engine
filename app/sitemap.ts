import type { MetadataRoute } from "next";
import { getServerSupabase } from "@/lib/server-supabase";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=process.env.NEXT_PUBLIC_APP_URL||"https://money-engine-omega.vercel.app";
 const db=getServerSupabase();
 const entries:MetadataRoute.Sitemap=[{url:base,lastModified:new Date(),changeFrequency:"daily",priority:1}];
 if(!db) return entries;
 const {data}=await db.from("product_briefs").select("opportunity_id,updated_at").eq("status","ready");
 for(const row of data||[]) entries.push({url:`${base}/offers/${row.opportunity_id}`,lastModified:new Date(row.updated_at),changeFrequency:"weekly",priority:0.8});
 return entries;
}
