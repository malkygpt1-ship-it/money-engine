import { getServerSupabase } from "@/lib/server-supabase";

export const dynamic="force-dynamic";

const registry=[
 {id:"scout",name:"Scout",role:"Demand discovery",autonomy:"green"},
 {id:"curator",name:"Curator",role:"Skill maintenance",autonomy:"green"},
 {id:"judge",name:"Judge",role:"Commercial validation",autonomy:"green"},
 {id:"forge",name:"Forge",role:"Offer + product production",autonomy:"amber"},
 {id:"distribution",name:"Distribution",role:"Campaign planning + publishing",autonomy:"amber"},
 {id:"fulfilment",name:"Fulfilment",role:"Payment-gated delivery",autonomy:"green"},
 {id:"ledger",name:"Ledger",role:"Revenue attribution + learning",autonomy:"green"},
];

export default async function AgentsPage(){
 const db=getServerSupabase();
 const {data:runs}=db?await db.from("agent_runs").select("*").order("created_at",{ascending:false}).limit(100):{data:[] as any[]};
 const {data:events}=db?await db.from("system_events").select("*").order("created_at",{ascending:false}).limit(50):{data:[] as any[]};
 const latest=(id:string)=>(runs||[]).find((r:any)=>r.agent_id===id);
 const latestEvent=(id:string)=>(events||[]).find((e:any)=>e.entity_type==="agent"&&e.entity_id===id);
 return <><div className="topbar"><div><div className="eyebrow">Agent workforce</div><h1>Agents</h1><div className="sub">Live runs, bounded autonomy and current module state.</div></div><div className="badge">{registry.length} registered workers</div></div><div className="grid two-col"><section className="card"><div className="section-title"><h2>Workers</h2><span>Supabase run ledger</span></div><div className="agent-list">{registry.map(a=>{const r=latest(a.id);const e=latestEvent(a.id);const running=e?.event_type==="agent.started" && (!r||new Date(e.created_at)>new Date(r.created_at));return <div className="agent" key={a.id} style={{padding:"15px 0"}}><div><div className="agent-name" style={{fontSize:15}}>{a.name}</div><div className="agent-role">{a.role}</div><div className="meta" style={{marginTop:7}}>{r?`${r.action} · ${r.status}`:"No recorded run yet"}</div></div><div style={{textAlign:"right"}}><span className="status"><span className={`dot ${running?"running":r?"idle":"attention"}`}></span>{running?"running":r?"idle":"waiting"}</span><div className={`autonomy ${a.autonomy}`} style={{marginTop:8}}>{a.autonomy} autonomy</div><div className="meta">{r?new Date(r.created_at).toLocaleString("en-GB"):"—"}</div></div></div>})}</div></section><section className="card"><div className="section-title"><h2>Autonomy policy</h2><span>default controls</span></div><div className="needs"><div className="need"><b style={{color:"var(--accent)"}}>GREEN</b><br/><span className="meta">Discovery, skill checks, validation, analytics and internal database writes.</span></div><div className="need"><b>AMBER</b><br/><span className="meta">AI asset generation and campaign production within explicit limits.</span></div><div className="need"><b style={{color:"var(--danger)"}}>RED</b><br/><span className="meta">Destructive actions, refunds and risky code changes remain human-gated.</span></div></div><div className="code" style={{marginTop:16}}>{`policy:\n  green_daily_budget_gbp: 5\n  amber_job_budget_gbp: 2\n  max_publications_per_day: 5\n  require_human_for:\n    - production_code\n    - refunds\n    - destructive_actions\n    - price_change_over_25_percent`}</div></section></div></>;
}
