import Link from "next/link";
import { KPI } from "@/components/kpi";
import { OpportunityTable } from "@/components/opportunity-table";
import { RevenueChart } from "@/components/revenue-chart";
import { RunWorkerButton } from "@/components/run-worker-button";
import { integrations } from "@/lib/integrations";
import { listOpportunities } from "@/lib/opportunity-store";
import { getServerSupabase, hasPersistentStore } from "@/lib/server-supabase";
import { getOpsStatus } from "@/lib/ops-status";

export const maxDuration=60;

const workers=[
 ["scout","Scout","Demand discovery","green"],["curator","Curator","Skill maintenance","green"],["judge","Judge","Commercial validation","green"],["forge","Forge","Offer + asset production","amber"],["distribution","Distribution","Campaign production","amber"],["ledger","Ledger","Revenue learning","green"]
] as const;

function londonDate(value:Date){return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/London",year:"numeric",month:"2-digit",day:"2-digit"}).format(value);}

export default async function Home(){
 const db=getServerSupabase();
 const [opportunities,ops,briefResult,campaignResult,revenueResult,runResult] = await Promise.all([
  listOpportunities(),getOpsStatus(),
  db?db.from("product_briefs").select("id,status",{count:"exact"}):Promise.resolve({data:[],count:0}),
  db?db.from("campaigns").select("id,status",{count:"exact"}):Promise.resolve({data:[],count:0}),
  db?db.from("revenue_events").select("net_gbp,occurred_at"):Promise.resolve({data:[]}),
  db?db.from("agent_runs").select("agent_id,action,status,created_at").order("created_at",{ascending:false}).limit(100):Promise.resolve({data:[]})
 ]);
 const briefs=(briefResult as any).data||[]; const campaigns=(campaignResult as any).data||[]; const revenue=(revenueResult as any).data||[]; const runs=(runResult as any).data||[];
 const counts = opportunities.reduce<Record<string,number>>((a,o)=>(a[o.status]=(a[o.status]||0)+1,a),{});
 const needsReview = opportunities.filter(o=>o.status==="scored" && o.score>=70).length;
 const todayLondon=londonDate(new Date());
 const revenueToday=revenue.filter((r:any)=>londonDate(new Date(r.occurred_at))===todayLondon).reduce((s:number,r:any)=>s+Number(r.net_gbp||0),0);
 const chartData=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const key=londonDate(d);const value=revenue.filter((r:any)=>londonDate(new Date(r.occurred_at))===key).reduce((s:number,r:any)=>s+Number(r.net_gbp||0),0);return {day:d.toLocaleDateString("en-GB",{weekday:"short",timeZone:"Europe/London"}),revenue:Number(value.toFixed(2))};});
 const readyAssets=briefs.filter((b:any)=>b.status==="ready").length;
 const plannedCampaigns=campaigns.filter((c:any)=>c.status==="planned").length;
 const fmt=(value:string|null)=>value?new Date(value).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/London"}):"No activity yet";
 const latestRun=(id:string)=>runs.find((r:any)=>r.agent_id===id);
 return <>
  <div className="topbar"><div><div className="eyebrow">Autonomous business OS</div><h1>Command centre</h1><div className="sub">Discover demand → validate → build → distribute → monetise → learn.</div></div><div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><RunWorkerButton/><div className="badge">{hasPersistentStore()?"Persistent engine online":"Demo mode · database not connected"}</div></div></div>
  <section className="ops-strip">
    <div><small>System</small><strong className={ops.system==="LIVE"?"ok":"warn"}>{ops.system}</strong></div>
    <div><small>Served deploy</small><strong className="ok">{ops.deployment}</strong></div>
    <div><small>Database</small><strong className={ops.database==="CONNECTED"?"ok":"warn"}>{ops.database}</strong></div>
    <div><small>Commit</small><strong>{ops.sha}</strong></div>
    <div><small>Last activity</small><strong>{fmt(ops.lastActivity)}</strong></div>
  </section>
  <section className="card activity-card">
    <div className="section-title"><h2>Live activity</h2><span>{ops.environment} · current served deployment</span></div>
    <div className="activity-grid">
      <div className="activity-current"><div className="eyebrow">Current deployment</div><strong>{ops.commitMessage}</strong><div className="meta">Commit {ops.sha}{ops.servedUrl?` · ${ops.servedUrl}`:""}</div></div>
      <div className="activity-feed">{ops.events.length?ops.events.map(e=><div className="activity-row" key={e.id}><span className={`activity-dot ${e.severity}`}></span><div><strong>{e.type.replaceAll("_"," ").replaceAll("."," · ")}</strong><div className="meta">{fmt(e.createdAt)}</div></div></div>):<div className="meta">No system events logged yet.</div>}</div>
    </div>
    <div className="meta" style={{marginTop:12}}>This feed is backed by the engine event ledger. Agent starts, decisions, product generation, campaign planning, payments and fulfilment appear here.</div>
  </section>
  <div className="grid kpis"><KPI label="Revenue today" value={`£${revenueToday.toFixed(2)}`} delta="verified net revenue"/><KPI label="Tracked opportunities" value={String(opportunities.length)} delta="live database"/><KPI label="Ready products" value={String(readyAssets)} delta={`${briefs.length} product briefs`}/><KPI label="Campaign queue" value={String(plannedCampaigns)} delta={`${campaigns.length} total campaigns`}/></div>
  <div className="grid two-col">
   <div className="grid">
    <section className="card"><div className="section-title"><h2>Opportunity pipeline</h2><span>Judge gates active</span></div><div className="pipeline">{["discovered","scored","approved","production","published"].map(s=><div className="pipe" key={s}><strong>{counts[s]||0}</strong><small>{s}</small></div>)}</div><div className="meta" style={{marginTop:10}}>{counts.paused||0} held by Judge for revalidation.</div></section>
    <section className="card"><div className="section-title"><h2>Revenue pulse</h2><span>{revenue.length?"Stripe ledger data":"awaiting first verified sale"}</span></div><RevenueChart data={chartData}/></section>
   </div>
   <div className="grid">
    <section className="card"><div className="section-title"><h2>Agents</h2><Link href="/agents">live registry →</Link></div><div className="agent-list">{workers.map(([id,name,role,autonomy])=>{const r=latestRun(id);return <div className="agent" key={id}><div><div className="agent-name">{name}</div><div className="agent-role">{role}</div></div><div style={{textAlign:"right"}}><span className="status"><span className={`dot ${r?"idle":"attention"}`}></span>{r?"idle":"waiting"}</span><div className={`autonomy ${autonomy}`} style={{marginTop:5}}>{autonomy}</div></div></div>})}</div></section>
    <section className="card"><div className="section-title"><h2>Needs you</h2><span>human / credential gates</span></div><div className="needs"><div className="need"><b>{needsReview}</b> opportunities awaiting manual review</div><div className="need"><b>{briefs.filter((b:any)=>b.status==="draft").length}</b> product assets awaiting AI generation</div><div className="need"><b>{plannedCampaigns}</b> campaigns waiting for channel execution</div><div className="need"><b>{hasPersistentStore()?"ON":"OFF"}</b> persistent data layer</div></div></section>
   </div>
  </div>
  <section className="card" style={{marginTop:16}}><div className="section-title"><h2>Top opportunities</h2><span>commercial score</span></div><OpportunityTable opportunities={opportunities.slice(0,12)}/></section>
  <section id="integrations" style={{marginTop:16}}><div className="section-title"><h2>Integration fabric</h2><span>plugin-owned capabilities behind one UI</span></div><div className="grid integration-grid">{integrations.map(i=><div className="card integration" key={i.id}><div className="state">{i.state}</div><h3>{i.name}</h3><p>{i.purpose}</p><ul>{i.autonomousActions.map(x=><li key={x}>{x}</li>)}</ul></div>)}</div></section>
 </>;
}
