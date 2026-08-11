"use server";

import { revalidatePath } from "next/cache";
import { updateOpportunityStatus } from "@/lib/opportunity-store";

export async function setOpportunityStatus(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as
    | "approved"
    | "production"
    | "published"
    | "paused";

  if (!id || !["approved", "production", "published", "paused"].includes(status)) {
    throw new Error("Invalid opportunity action");
  }

  await updateOpportunityStatus(id, status);
  revalidatePath("/");
  revalidatePath("/opportunities");
}
