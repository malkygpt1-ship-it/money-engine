import { KPI } from "@/components/kpi";
import { OpportunityTable } from "@/components/opportunity-table";
import { RevenueChart } from "@/components/revenue-chart";
import { Status } from "@/components/status";
import { agents, opportunities } from "@/lib/demo-data";
import { integrations } from "@/lib/integrations";
import { isDemoMode } from "@/lib/supabase";

export default function Home(){
 const counts = opportunities.reduce<Record<string,number>>((a,o)=>(a[o.status]=(a[o.status]||0)+1,a),{});
 return <>
  <div className="topbar"><div><div className="eyebrow">Autonomous business OS</div><h1>Command centre</h1><div className="sub">Discover demand → build assets → publish → monetise → learn.</div></div><div className="badge">{isDemoMode()?"Demo mode · Supabase ready":"Supabase connected"}</div></div>
  <div className="grid kpis"><KPI label="Revenue today" value="£46.20" delta="+18.4% vs prior day"/><KPI label="7 day revenue" value="£343.00" delta="+22.7%"/><KPI label="30 day revenue" value="£1,127.80" delta="+31.2%"/><KPI label="Automation ROI" value="14.8×" delta="£76.20 operating cost"/></div>
  <div className="grid two-col">
   <div className="grid">
    <section className="card"><div className="section-title"><h2>Opportunity pipeline</h2><span>qualification gates active</span></div><div className="pipeline">{["discovered","scored","approved","production","published"].map(s=><div className="pipe" key={s}><strong>{counts[s]||0}</strong><small>{s}</small></div>)}</div></section>
    <section className="card"><div className="section-title"><h2>Revenue pulse</h2><span>last 7 days</span></div><RevenueChart/></section>
   </div>
   <div className="grid">
    <section className="card"><div className="section-title"><h2>Agents</h2><span>6 workers</span></div><div className="agent-list">{agents.map(a=><div className="agent" key={a.id}><div><div className="agent-name">{a.name}</div><div className="agent-role">{a.role}</div></div><div style={{textAlign:"right"}}><Status value={a.status}/><div className={`autonomy ${a.autonomy}`} style={{marginTop:5}}>{a.autonomy}</div></div></div>)}</div></section>
    <section className="card"><div className="section-title"><h2>Needs you</h2><span>human gates</span></div><div className="needs"><div className="need"><b>1</b> production deployment awaiting approval</div><div className="need"><b>2</b> high-score opportunities need commercial review</div><div className="need"><b>£74.20</b> pending payout reconciliation</div></div></section>
   </div>
  </div>
  <section className="card" style={{marginTop:16}}><div className="section-title"><h2>Top opportunities</h2><span>sorted by commercial score</span></div><OpportunityTable/></section>
  <section id="integrations" style={{marginTop:16}}><div className="section-title"><h2>Integration fabric</h2><span>plugin-owned capabilities behind one UI</span></div><div className="grid integration-grid">{integrations.map(i=><div className="card integration" key={i.id}><div className="state">{i.state}</div><h3>{i.name}</h3><p>{i.purpose}</p><ul>{i.autonomousActions.map(x=><li key={x}>{x}</li>)}</ul></div>)}</div></section>
 </>;
}
