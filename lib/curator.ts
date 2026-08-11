import { createHash } from "node:crypto";
import { getServerSupabase } from "@/lib/server-supabase";

function checksum(text:string){return createHash("sha256").update(text).digest("hex");}

export async function curateSkills(){
 const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
 const {data:skills,error}=await db.from("skills").select("*").eq("status","active"); if(error) throw new Error(error.message);
 let checked=0,staged=0,failed=0;
 for(const skill of skills||[]){
  if(!skill.source_url){await db.from("skills").update({last_checked_at:new Date().toISOString()}).eq("id",skill.id);checked++;continue;}
  try{
   const url=new URL(skill.source_url);
   if(!["https:"].includes(url.protocol)) throw new Error("Only HTTPS skill sources are allowed");
   const res=await fetch(url.toString(),{headers:{"User-Agent":"Money-Engine-Curator/1.0"},signal:AbortSignal.timeout(12000)});
   if(!res.ok) throw new Error(`Source returned ${res.status}`);
   const text=(await res.text()).slice(0,250000); const hash=checksum(text);
   const currentHash=checksum(skill.instructions||"");
   if(hash!==currentHash){
    const {error:stageError}=await db.from("skill_candidates").upsert({skill_id:skill.id,source_url:url.toString(),candidate_version:null,content:text,checksum:hash,status:"staged"},{onConflict:"skill_id,checksum"});
    if(stageError) throw new Error(stageError.message); staged++;
    await db.from("system_events").insert({event_type:"curator.candidate_staged",entity_type:"skill",entity_id:skill.id,severity:"info",payload:{slug:skill.slug,source:url.toString(),checksum:hash.slice(0,12)}});
   }
   await db.from("skills").update({last_checked_at:new Date().toISOString()}).eq("id",skill.id); checked++;
  }catch(err){
   failed++;
   await db.from("system_events").insert({event_type:"curator.source_failed",entity_type:"skill",entity_id:skill.id,severity:"warning",payload:{slug:skill.slug,error:err instanceof Error?err.message:"source failed"}});
  }
 }
 return {skills:skills?.length||0,checked,staged,failed};
}
