import { getServerSupabase } from "@/lib/server-supabase";

export const dynamic="force-dynamic";

export default async function SkillsPage(){
  const db=getServerSupabase();
  const [{data:skills},{data:links},{data:candidates}]=db?await Promise.all([
    db.from("skills").select("*").order("domain").order("name"),
    db.from("agent_skills").select("agent_id,skill_id,priority"),
    db.from("skill_candidates").select("*,skills(name,slug)").order("discovered_at",{ascending:false}).limit(30)
  ]):[{data:[]},{data:[]},{data:[]}];
  const owners=(id:string)=>(links||[]).filter((x:any)=>x.skill_id===id).map((x:any)=>x.agent_id).join(", ")||"unassigned";
  return <>
    <div className="topbar"><div><div className="eyebrow">Agent academy</div><h1>Skill registry</h1><div className="sub">Versioned operating knowledge loaded by specialist agents.</div></div><div className="badge">{skills?.length||0} active · {candidates?.length||0} staged</div></div>
    <section className="card"><div className="section-title"><h2>Production skills</h2><span>Curator health-checks these packs</span></div><div className="table-wrap"><table><thead><tr><th>Skill</th><th>Domain</th><th>Version</th><th>Eval</th><th>Trust</th><th>Used by</th><th>Last checked</th></tr></thead><tbody>{(skills||[]).map((s:any)=><tr key={s.id}><td><strong>{s.name}</strong><div className="meta">{s.slug}</div></td><td>{s.domain}</td><td>{s.version}</td><td className="score">{Number(s.eval_score).toFixed(0)}</td><td>{s.trust_level}</td><td>{owners(s.id)}</td><td>{s.last_checked_at?new Date(s.last_checked_at).toLocaleString("en-GB"):"Not yet"}</td></tr>)}</tbody></table></div></section>
    <section className="card" style={{marginTop:16}}><div className="section-title"><h2>Curator update queue</h2><span>external changes are staged, never blindly trusted</span></div>{(candidates||[]).length?<div className="table-wrap"><table><thead><tr><th>Skill</th><th>Status</th><th>Checksum</th><th>Discovered</th><th>Source</th></tr></thead><tbody>{(candidates||[]).map((c:any)=><tr key={c.id}><td><strong>{c.skills?.name||"Skill"}</strong></td><td>{c.status}</td><td className="meta">{c.checksum.slice(0,12)}</td><td>{new Date(c.discovered_at).toLocaleString("en-GB")}</td><td className="meta">{c.source_url}</td></tr>)}</tbody></table></div>:<p className="sub">No upstream changes staged. Add a trusted HTTPS source URL to a skill and Curator will monitor it.</p>}</section>
    <section className="card" style={{marginTop:16}}><div className="section-title"><h2>How skills work</h2><span>runtime expertise, not model retraining</span></div><p className="sub">Agents load role-specific instruction packs at runtime. Curator checks configured upstream sources and stages changed versions for evaluation rather than silently replacing production knowledge.</p></section>
  </>;
}
