"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

function BackButtonClient({
  className,
  ariaLabel,
  children,
}: {
  className: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => router.back()}
      className={className}
    >
      {children}
    </button>
  );
}

export default BackButtonClient;
