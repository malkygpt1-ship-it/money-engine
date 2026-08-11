import { getServerSupabase } from "@/lib/server-supabase";

async function callOpenAI(prompt:string){
 const key=process.env.OPENAI_API_KEY; if(!key) throw new Error("OPENAI_API_KEY is not configured");
 const res=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5",store:false,instructions:"You create original, practical digital products. Do not copy copyrighted text. Be accurate, useful, concise, and clearly distinguish facts from recommendations.",input:prompt})});
 if(!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
 const json=await res.json();
 const text=(json.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==="output_text").map((x:any)=>x.text).join("\n");
 if(!text) throw new Error("OpenAI returned no product content"); return text;
}

export async function generateProductAssets(limit=2){
 const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
 const {data,error}=await db.from("product_briefs").select("*,opportunities(title,niche,monthly_searches,score)").eq("status","draft").limit(limit); if(error) throw new Error(error.message);
 let generated=0;
 for(const b of data||[]){
  await db.from("system_events").insert({event_type:"asset_generation.started",entity_type:"opportunity",entity_id:b.opportunity_id,severity:"info",payload:{product:b.name}});
  const o=b.opportunities;
  const prompt=`Create the complete original content for a paid digital product named "${b.name}".\nAudience: ${b.audience}\nPromise: ${b.promise}\nDeliverable: ${b.deliverable}\nTopic: ${o?.title}\nNiche: ${o?.niche}\n\nReturn polished Markdown suitable for immediate web delivery. Include a concise introduction, useful core sections, an actionable checklist, a reusable worksheet/template, caveats where relevant, and a short next-steps section. Do not claim access to facts you cannot verify and do not reproduce copyrighted passages.`;
  try{
   const markdown=await callOpenAI(prompt);
   await db.from("assets").insert({opportunity_id:b.opportunity_id,type:"digital_product",provider:"openai",status:"ready",metadata:{product_brief_id:b.id,content_markdown:markdown}});
   await db.from("product_briefs").update({status:"ready",updated_at:new Date().toISOString()}).eq("id",b.id);
   await db.from("agent_runs").insert({agent_id:"forge",opportunity_id:b.opportunity_id,autonomy:"amber",action:"generate_product_asset",status:"completed",output:{characters:markdown.length}});
   await db.from("system_events").insert({event_type:"asset_generation.completed",entity_type:"opportunity",entity_id:b.opportunity_id,severity:"info",payload:{product:b.name,characters:markdown.length}}); generated++;
  }catch(err){
   await db.from("system_events").insert({event_type:"asset_generation.blocked",entity_type:"opportunity",entity_id:b.opportunity_id,severity:"warning",payload:{product:b.name,error:err instanceof Error?err.message:"generation failed"}});
  }
 }
 return {generated};
}
