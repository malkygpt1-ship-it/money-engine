import { getServerSupabase } from "@/lib/server-supabase";

export const dynamic="force-dynamic";

export default async function FactoryPage(){
 const db=getServerSupabase();
 const [{data:briefs},{data:campaigns},{data:orders}]=db?await Promise.all([
  db.from("product_briefs").select("*,opportunities(title,status)").order("created_at",{ascending:false}),
  db.from("campaigns").select("*,opportunities(title)").order("created_at",{ascending:false}),
  db.from("orders").select("*").order("created_at",{ascending:false}).limit(20)
 ]):[{data:[]},{data:[]},{data:[]}];
 return <>
  <div className="topbar"><div><div className="eyebrow">Production floor</div><h1>Factory</h1><div className="sub">Forge offers → Distribution plans campaigns → Fulfilment delivers paid products.</div></div><div className="badge">{briefs?.length||0} product briefs</div></div>
  <div className="grid kpis"><div className="card"><div className="kpi-label">Product briefs</div><div className="kpi-value">{briefs?.length||0}</div></div><div className="card"><div className="kpi-label">Campaigns</div><div className="kpi-value">{campaigns?.length||0}</div></div><div className="card"><div className="kpi-label">Orders</div><div className="kpi-value">{orders?.length||0}</div></div><div className="card"><div className="kpi-label">Fulfilled</div><div className="kpi-value">{(orders||[]).filter((o:any)=>o.fulfilment_status==="fulfilled").length}</div></div></div>
  <section className="card"><div className="section-title"><h2>Forge output</h2><span>commercial products awaiting asset generation / publishing</span></div><div className="table-wrap"><table><thead><tr><th>Opportunity</th><th>Product</th><th>Type</th><th>Price</th><th>Status</th><th>Promise</th></tr></thead><tbody>{(briefs||[]).map((b:any)=><tr key={b.id}><td>{b.opportunities?.title||"—"}</td><td><strong>{b.name}</strong></td><td>{b.product_type}</td><td>£{Number(b.price_gbp).toFixed(2)}</td><td>{b.status}</td><td>{b.promise}</td></tr>)}</tbody></table></div></section>
  <section className="card" style={{marginTop:16}}><div className="section-title"><h2>Distribution queue</h2><span>channel-specific campaign plans</span></div><div className="table-wrap"><table><thead><tr><th>Opportunity</th><th>Channel</th><th>Title</th><th>CTA</th><th>Status</th><th>UTM</th></tr></thead><tbody>{(campaigns||[]).map((c:any)=><tr key={c.id}><td>{c.opportunities?.title||"—"}</td><td>{c.channel}</td><td>{c.title}</td><td>{c.cta}</td><td>{c.status}</td><td className="meta">{c.utm_code}</td></tr>)}</tbody></table></div></section>
 </>;
}
