import { NextResponse } from "next/server";

async function hash(value:string){
 const bytes=new TextEncoder().encode(value); const digest=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export async function POST(req:Request){
 const password=process.env.ADMIN_PASSWORD; if(!password) return NextResponse.json({error:"Admin password is not configured"},{status:503});
 const form=await req.formData(); if(String(form.get("password")||"")!==password) return NextResponse.redirect(new URL("/login?error=1",req.url),303);
 const target=String(form.get("next")||"/"); const safe=target.startsWith("/")&&!target.startsWith("//")?target:"/";
 const res=NextResponse.redirect(new URL(safe,req.url),303);
 res.cookies.set("money_engine_admin",await hash(password),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:60*60*24*30});
 return res;
}
