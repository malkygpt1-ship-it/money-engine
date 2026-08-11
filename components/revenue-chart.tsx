"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({data}:{data:Array<{day:string,revenue:number}>}){
 return <div style={{height:240}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="currentColor" stopOpacity={0.32}/><stop offset="95%" stopColor="currentColor" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="day" stroke="#7890ad" tickLine={false} axisLine={false}/><YAxis stroke="#7890ad" tickLine={false} axisLine={false} tickFormatter={(v)=>`£${v}`}/><Tooltip contentStyle={{background:"#0d1b2e",border:"1px solid #1f3551",borderRadius:10}} formatter={(v)=>[`£${Number(v).toFixed(2)}`,"Revenue"]}/><Area type="monotone" dataKey="revenue" stroke="currentColor" fill="url(#fill)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
}
