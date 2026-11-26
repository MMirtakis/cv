"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkPaidButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const next = status === "paid" ? "pending" : "paid";

  async function toggle() {
    setBusy(true);
    await fetch("/api/obligations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" className="ghost-btn" onClick={toggle} disabled={busy}>
      {status === "paid" ? "Επαναφορά" : "Πληρώθηκε"}
    </button>
  );
}
