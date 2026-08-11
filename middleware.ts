import { NextRequest, NextResponse } from "next/server";

async function hash(value:string){
 const bytes=new TextEncoder().encode(value);
 const digest=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export async function middleware(req:NextRequest){
 const password=process.env.ADMIN_PASSWORD;
 if(!password) return NextResponse.next();
 const path=req.nextUrl.pathname;
 const publicPath=path==="/login"||path==="/shop"||path.startsWith("/offers/")||path.startsWith("/delivery/")||path.startsWith("/api/delivery/")||path==="/api/checkout"||path.startsWith("/api/ingest/")||path.startsWith("/api/engine/")||path==="/robots.txt"||path==="/sitemap.xml";
 if(publicPath) return NextResponse.next();
 const expected=await hash(password);
 if(req.cookies.get("money_engine_admin")?.value===expected) return NextResponse.next();
 const url=req.nextUrl.clone(); url.pathname="/login"; url.searchParams.set("next",path);
 return NextResponse.redirect(url);
}

export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
