import { NextResponse } from "next/server";
import { runEngine } from "@/lib/engine";

function authorised(req:Request){
  const secret=process.env.INGESTION_SECRET;
  if(!secret) return false;
  const auth=req.headers.get("authorization");
  return auth===`Bearer ${secret}` || req.headers.get("x-engine-secret")===secret;
}

export async function POST(req:Request){
  if(!authorised(req)) return NextResponse.json({error:"unauthorised"},{status:401});
  try{
    const body=await req.json().catch(()=>({}));
    const modules=Array.isArray(body.modules)?body.modules:undefined;
    const result=await runEngine(modules);
    return NextResponse.json({ok:true,result});
  }catch(error){
    return NextResponse.json({ok:false,error:error instanceof Error?error.message:"engine failed"},{status:500});
  }
}
