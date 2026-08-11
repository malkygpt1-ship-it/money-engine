"use server";

import { revalidatePath } from "next/cache";
import { runEngine } from "@/lib/engine";
import { runStripeWorker } from "@/lib/stripe-worker";

export async function runWorkerNow(){
  if(!process.env.CRON_SECRET) throw new Error("CRON_SECRET is not configured");
  const engine=await runEngine();
  const stripe=await runStripeWorker();
  revalidatePath("/");
  return {engine,stripe};
}
