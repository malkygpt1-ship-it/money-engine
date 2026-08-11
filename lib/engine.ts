import { getServerSupabase } from "@/lib/server-supabase";
import { generateProductAssets } from "@/lib/asset-generator";
import { curateSkills } from "@/lib/curator";

type EngineModule = "judge" | "forge" | "assets" | "distribution" | "ledger" | "curator";

async function event(type:string, payload:Record<string,unknown>={}, entityType="system", entityId?:string){
  const db=getServerSupabase(); if(!db) return;
  await db.from("system_events").insert({event_type:type,entity_type:entityType,entity_id:entityId,severity:"info",payload});
}

async function runLog(agent:string, action:string, opportunityId:string|null, output:Record<string,unknown>){
  const db=getServerSupabase(); if(!db) return;
  await db.from("agent_runs").insert({agent_id:agent,opportunity_id:opportunityId,autonomy:agent==="forge"||agent==="distribution"?"amber":"green",action,status:"completed",output});
}

export async function runJudge(){
  const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
  await event("agent.started",{agent:"judge"},"agent","judge");
  const {data,error}=await db.from("opportunities").select("*").eq("status","scored").order("score",{ascending:false});
  if(error) throw new Error(error.message);
  let approved=0, held=0;
  for(const o of data||[]){
    const durablePenalty=(o.provider_payload?.growth_pct||0)>4000?7:0;
    const commercial=Math.max(0,Math.min(100,Number(o.commercial_intent||0)));
    const adjusted=Math.round(Number(o.score||0)*0.55+commercial*0.3+(100-Number(o.competition||0))*0.15-durablePenalty);
    const pass=adjusted>=63 && commercial>=45;
    await db.from("opportunities").update({score:adjusted,status:pass?"approved":"paused",next_action:pass?"Forge product brief":"Hold / revalidate demand",updated_at:new Date().toISOString()}).eq("id",o.id);
    await runLog("judge","commercial_validation",o.id,{adjustedScore:adjusted,decision:pass?"approved":"held",durablePenalty});
    await event(pass?"judge.approved":"judge.held",{title:o.title,score:adjusted},"opportunity",o.id);
    pass?approved++:held++;
  }
  await event("agent.completed",{agent:"judge",approved,held},"agent","judge");
  return {approved,held};
}

function forgeOffer(title:string,niche:string,score:number){
  const lower=`${title} ${niche}`.toLowerCase();
  const type=lower.includes("game")||lower.includes("roblox")?"resource_pack":lower.includes("business")||lower.includes("consult")?"toolkit":"digital_guide";
  const price=score>=80?12:score>=70?9:7;
  const name=title.replace(/\b\w/g,c=>c.toUpperCase())+" Toolkit";
  return {type,price,name,audience:`People actively searching for “${title}”`,promise:`A practical, focused resource that helps users act on ${title} without unnecessary research.`,deliverable:type==="resource_pack"?"Curated resource pack + checklist":"Concise guide + checklist + reusable worksheet"};
}

export async function runForge(){
  const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
  await event("agent.started",{agent:"forge"},"agent","forge");
  const {data,error}=await db.from("opportunities").select("*").eq("status","approved").order("score",{ascending:false}); if(error) throw new Error(error.message);
  let created=0;
  for(const o of data||[]){
    const f=forgeOffer(o.title,o.niche,o.score);
    const {error:upsertError}=await db.from("product_briefs").upsert({opportunity_id:o.id,product_type:f.type,name:f.name,price_gbp:f.price,audience:f.audience,promise:f.promise,deliverable:f.deliverable,fulfilment_type:"digital",status:"draft",metadata:{generated_by:"forge-v1"}},{onConflict:"opportunity_id"});
    if(upsertError) throw new Error(upsertError.message);
    await db.from("opportunities").update({product_name:f.name,product_price:f.price,status:"production",next_action:"Generate product asset",updated_at:new Date().toISOString()}).eq("id",o.id);
    await runLog("forge","offer_design",o.id,{...f});
    await event("forge.brief_created",{title:o.title,product:f.name,price:f.price},"opportunity",o.id); created++;
  }
  await event("agent.completed",{agent:"forge",created},"agent","forge"); return {created};
}

export async function runDistribution(){
  const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
  await event("agent.started",{agent:"distribution"},"agent","distribution");
  const {data,error}=await db.from("opportunities").select("id,title,score,status").eq("status","production"); if(error) throw new Error(error.message);
  let planned=0;
  for(const o of data||[]){
    const campaigns=[
      {channel:"seo",title:`${o.title}: practical guide`,hook:`Everything needed to act on ${o.title}`,cta:"Get the toolkit"},
      {channel:"youtube",title:`${o.title} — what you need to know`,hook:`Why ${o.title} is gaining attention and what to do next`,cta:"Toolkit linked below"},
      {channel:"email",title:`Your ${o.title} resource`,hook:"Keep the useful bits and skip the noise",cta:"Open the toolkit"}
    ];
    for(const c of campaigns) await db.from("campaigns").upsert({...c,opportunity_id:o.id,status:"planned",utm_code:`me_${o.id.slice(0,8)}_${c.channel}`,metadata:{generated_by:"distribution-v1"}},{onConflict:"opportunity_id,channel"});
    await runLog("distribution","campaign_plan",o.id,{channels:campaigns.map(c=>c.channel)});
    await event("distribution.plan_created",{title:o.title,channels:campaigns.map(c=>c.channel)},"opportunity",o.id); planned++;
  }
  await event("agent.completed",{agent:"distribution",planned},"agent","distribution"); return {planned};
}

export async function runCurator(){
  await event("agent.started",{agent:"curator"},"agent","curator");
  const result=await curateSkills();
  await runLog("curator","skill_health_check",null,result);
  await event("agent.completed",{agent:"curator",...result},"agent","curator");
  return result;
}

export async function runLedger(){
  const db=getServerSupabase(); if(!db) throw new Error("Database unavailable");
  await event("agent.started",{agent:"ledger"},"agent","ledger");
  const {data,error}=await db.from("revenue_events").select("gross_gbp,fee_gbp,opportunity_id"); if(error) throw new Error(error.message);
  const gross=(data||[]).reduce((s:number,r:any)=>s+Number(r.gross_gbp||0),0); const fees=(data||[]).reduce((s:number,r:any)=>s+Number(r.fee_gbp||0),0);
  await db.from("engine_state").upsert({key:"ledger_summary",value:{gross,fees,net:gross-fees,eventCount:data?.length||0,calculatedAt:new Date().toISOString()},updated_at:new Date().toISOString()});
  await runLog("ledger","revenue_reconcile",null,{gross,fees,net:gross-fees}); await event("agent.completed",{agent:"ledger",gross,net:gross-fees},"agent","ledger"); return {gross,fees,net:gross-fees};
}

export async function runEngine(modules:EngineModule[]=["curator","judge","forge","assets","distribution","ledger"]){
  const result:Record<string,unknown>={};
  for(const m of modules){
    if(m==="curator") result.curator=await runCurator();
    if(m==="judge") result.judge=await runJudge();
    if(m==="forge") result.forge=await runForge();
    if(m==="assets") result.assets=await generateProductAssets();
    if(m==="distribution") result.distribution=await runDistribution();
    if(m==="ledger") result.ledger=await runLedger();
  }
  return result;
}
