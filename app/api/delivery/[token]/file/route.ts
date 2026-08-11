import { getServerSupabase } from "@/lib/server-supabase";

export const dynamic="force-dynamic";

export async function GET(_req:Request,{params}:{params:Promise<{token:string}>}){
 const {token}=await params; const db=getServerSupabase();
 if(!db) return new Response("Unavailable",{status:503});
 const {data:t}=await db.from("delivery_tokens").select("*").eq("token",token).maybeSingle();
 if(!t || new Date(t.expires_at)<new Date()) return new Response("Invalid or expired delivery link",{status:403});
 const {data:a}=await db.from("assets").select("*").eq("opportunity_id",t.opportunity_id).eq("type","digital_product").eq("status","ready").order("created_at",{ascending:false}).limit(1).maybeSingle();
 const content=a?.metadata?.file_content; if(typeof content!=="string") return new Response("No downloadable file for this product",{status:404});
 const filename=typeof a.metadata?.file_name==="string"?a.metadata.file_name:"money-engine-product.txt";
 const mime=typeof a.metadata?.file_mime==="string"?a.metadata.file_mime:"text/plain; charset=utf-8";
 return new Response(content,{headers:{"Content-Type":mime,"Content-Disposition":`attachment; filename="${filename.replace(/[\"\r\n]/g,"")}"`,"Cache-Control":"private, no-store"}});
}
