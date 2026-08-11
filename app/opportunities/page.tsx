import { OpportunityTable } from "@/components/opportunity-table";
import { listOpportunities } from "@/lib/opportunity-store";
import { hasPersistentStore } from "@/lib/server-supabase";
import { setOpportunityStatus } from "./actions";

export default async function OpportunitiesPage({searchParams}:{searchParams:Promise<{selected?:string}>}){
  const params=await searchParams;
  const opportunities=await listOpportunities();
  const selected=opportunities.find(o=>o.id===params.selected) ?? opportunities[0];

  if (!selected) return <div className="card"><h1>No opportunities yet</h1><p className="sub">The discovery worker has not ingested any opportunities.</p></div>;

  return <>
    <div className="topbar"><div><div className="eyebrow">Opportunity factory</div><h1>Opportunities</h1><div className="sub">Rank demand against competition, buyer intent and monetisation fit.</div></div><div className="badge">{hasPersistentStore()?"Live controls":"Demo controls"}</div></div>
    <section className="card hero-card">
      <div className="hero-row"><div><div className="eyebrow">Selected · {selected.id}</div><h2 style={{fontSize:24,margin:"8px 0 4px"}}>{selected.title}</h2><div className="sub">{selected.niche} · sourced by {selected.source}</div></div><div><div className="meta">Opportunity score</div><div className="hero-score">{selected.score}</div></div></div>
      <div className="metric-row"><div className="metric"><small>Demand</small><strong>{selected.demand}/100</strong></div><div className="metric"><small>Competition</small><strong>{selected.competition}/100</strong></div><div className="metric"><small>Commercial intent</small><strong>{selected.commercialIntent}/100</strong></div><div className="metric"><small>Monthly searches</small><strong>{selected.monthlySearches.toLocaleString()}</strong></div></div>
      <div className="metric-row"><div className="metric"><small>Proposed product</small><strong>{selected.product}</strong></div><div className="metric"><small>Price</small><strong>£{selected.price.toFixed(2)}</strong></div><div className="metric"><small>30d revenue</small><strong>£{selected.revenue30d.toFixed(2)}</strong></div><div className="metric"><small>Next action</small><strong style={{fontSize:13}}>{selected.nextAction}</strong></div></div>
      <div className="actions">
        <form action={setOpportunityStatus}><input type="hidden" name="id" value={selected.id}/><input type="hidden" name="status" value="approved"/><button className="btn primary">Approve</button></form>
        <form action={setOpportunityStatus}><input type="hidden" name="id" value={selected.id}/><input type="hidden" name="status" value="production"/><button className="btn">Start production</button></form>
        <form action={setOpportunityStatus}><input type="hidden" name="id" value={selected.id}/><input type="hidden" name="status" value="paused"/><button className="btn danger">Pause</button></form>
      </div>
    </section>
    <section className="card" style={{marginTop:16}}><div className="section-title"><h2>All opportunities</h2><span>{opportunities.length} tracked</span></div><OpportunityTable opportunities={opportunities}/></section>
  </>;
}
