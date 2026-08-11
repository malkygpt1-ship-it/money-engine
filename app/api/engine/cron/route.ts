import { runEngine } from "@/lib/engine";
import { runStripeWorker } from "@/lib/stripe-worker";

export const dynamic="force-dynamic";
export const maxDuration=60;

export async function GET(req:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret || req.headers.get("authorization")!==`Bearer ${secret}`) return new Response("Unauthorized",{status:401});
  try{
    const engine=await runEngine();
    const stripe=await runStripeWorker();
    return Response.json({ok:true,result:{engine,stripe},ranAt:new Date().toISOString()});
  }catch(error){
    return Response.json({ok:false,error:error instanceof Error?error.message:"engine failed"},{status:500});
  }
}
