"use server";

import { revalidatePath } from "next/cache";
import { runEngine } from "@/lib/engine";

export async function runWorkerNow(){
  if(!process.env.CRON_SECRET) throw new Error("CRON_SECRET is not configured");
  await runEngine();
  revalidatePath("/");
}
