"use client";

import { useFormStatus } from "react-dom";
import { runWorkerNow } from "@/app/actions";

function SubmitButton(){
  const { pending } = useFormStatus();
  return <button className="btn primary" type="submit" disabled={pending}>{pending?"Running worker…":"Run worker now"}</button>;
}

export function RunWorkerButton(){
  return <form action={runWorkerNow}><SubmitButton/></form>;
}
