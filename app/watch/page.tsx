"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import WatchDetailClient from "./[id]/WatchDetailClient";

function WatchQueryContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  return <WatchDetailClient productId={id} />;
}

export default function WatchQueryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-brand-green-dark">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-gold/20 border-t-brand-gold" />
        </div>
      }
    >
      <WatchQueryContent />
    </Suspense>
  );
}