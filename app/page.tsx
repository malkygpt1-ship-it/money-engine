import { KPI } from "@/components/kpi";
import { OpportunityTable } from "@/components/opportunity-table";
import { RevenueChart } from "@/components/revenue-chart";
import { Status } from "@/components/status";
import { agents } from "@/lib/demo-data";
import { integrations } from "@/lib/integrations";
import { listOpportunities } from "@/lib/opportunity-store";
import { hasPersistentStore } from "@/lib/server-supabase";

export default async function Home(){
 const opportunities = await listOpportunities();
 const counts = opportunities.reduce<Record<string,number>>((a,o)=>(a[o.status]=(a[o.status]||0)+1,a),{});
 const needsReview = opportunities.filter(o=>o.status==="scored" && o.score>=70).length;
 return <>
  <div className="topbar"><div><div className="eyebrow">Autonomous business OS</div><h1>Command centre</h1><div className="sub">Discover demand → build assets → publish → monetise → learn.</div></div><div className="badge">{hasPersistentStore()?"Persistent engine online":"Demo mode · database not connected"}</div></div>
  <div className="grid kpis"><KPI label="Revenue today" value="£46.20" delta="revenue adapter next"/><KPI label="Tracked opportunities" value={String(opportunities.length)} delta="live data source"/><KPI label="Ready for review" value={String(needsReview)} delta="score ≥ 70"/><KPI label="Published assets" value={String(counts.published||0)} delta="feedback loop target"/></div>
  <div className="grid two-col">
   <div className="grid">
    <section className="card"><div className="section-title"><h2>Opportunity pipeline</h2><span>qualification gates active</span></div><div className="pipeline">{["discovered","scored","approved","production","published"].map(s=><div className="pipe" key={s}><strong>{counts[s]||0}</strong><small>{s}</small></div>)}</div></section>
    <section className="card"><div className="section-title"><h2>Revenue pulse</h2><span>demo until Stripe ledger is connected</span></div><RevenueChart/></section>
   </div>
   <div className="grid">
    <section className="card"><div className="section-title"><h2>Agents</h2><span>6 workers</span></div><div className="agent-list">{agents.map(a=><div className="agent" key={a.id}><div><div className="agent-name">{a.name}</div><div className="agent-role">{a.role}</div></div><div style={{textAlign:"right"}}><Status value={a.status}/><div className={`autonomy ${a.autonomy}`} style={{marginTop:5}}>{a.autonomy}</div></div></div>)}</div></section>
    <section className="card"><div className="section-title"><h2>Needs you</h2><span>human gates</span></div><div className="needs"><div className="need"><b>{needsReview}</b> commercially interesting opportunities awaiting review</div><div className="need"><b>{counts.approved||0}</b> approved opportunities ready for production</div><div className="need"><b>{hasPersistentStore()?"ON":"OFF"}</b> persistent data layer</div></div></section>
   </div>
  </div>
  <section className="card" style={{marginTop:16}}><div className="section-title"><h2>Top opportunities</h2><span>sorted by commercial score</span></div><OpportunityTable opportunities={opportunities.slice(0,12)}/></section>
  <section id="integrations" style={{marginTop:16}}><div className="section-title"><h2>Integration fabric</h2><span>plugin-owned capabilities behind one UI</span></div><div className="grid integration-grid">{integrations.map(i=><div className="card integration" key={i.id}><div className="state">{i.state}</div><h3>{i.name}</h3><p>{i.purpose}</p><ul>{i.autonomousActions.map(x=><li key={x}>{x}</li>)}</ul></div>)}</section>
 </>;
}
