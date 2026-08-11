import Link from "next/link";
import { opportunities } from "@/lib/demo-data";
import { Status } from "./status";
export function OpportunityTable(){return <div className="table-wrap"><table><thead><tr><th>Opportunity</th><th>Score</th><th>Status</th><th>Searches</th><th>Product</th><th>30d revenue</th></tr></thead><tbody>{opportunities.map(o=><tr key={o.id}><td><Link href={`/opportunities?selected=${o.id}`}><strong>{o.title}</strong></Link><div className="meta">{o.niche} · {o.source}</div></td><td className="score">{o.score}</td><td><Status value={o.status}/></td><td>{o.monthlySearches.toLocaleString()}</td><td>{o.product}<div className="meta">£{o.price.toFixed(2)}</div></td><td>£{o.revenue30d.toFixed(2)}</td></tr>)}</tbody></table></div>}
