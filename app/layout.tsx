import type { Metadata } from "next";
import Link from "next/link";
import { Bot, CircleDollarSign, LayoutDashboard, Lightbulb, PlugZap } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = { title: "Money Engine", description: "Autonomous opportunity-to-revenue operating system" };

const nav = [
  ["/", "Command", LayoutDashboard],
  ["/opportunities", "Opportunities", Lightbulb],
  ["/agents", "Agents", Bot],
  ["/revenue", "Revenue", CircleDollarSign],
  ["/#integrations", "Integrations", PlugZap],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="shell"><aside className="sidebar"><div className="brand">MONEY<span>ENGINE</span></div><nav className="nav">{nav.map(([href,label,Icon]) => <Link href={href as string} key={href as string}><Icon size={16}/>{label as string}</Link>)}</nav><div style={{marginTop:28,padding:"0 9px"}}><div className="eyebrow">Autonomy</div><div className="meta" style={{marginTop:8,lineHeight:1.7}}>Green runs freely.<br/>Amber runs inside budgets.<br/>Red waits for approval.</div></div></aside><main className="main"><div className="container">{children}</div></main></div></body></html>;
}
