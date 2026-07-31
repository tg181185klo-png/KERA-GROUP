"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  consumeScrollTarget,
  scrollToSection,
} from "@/lib/scroll-to-section";

function scrollFromHash() {
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;

  const id = decodeURIComponent(hash.slice(1));
  scrollToSection(id);
}

export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const queued = consumeScrollTarget();
    if (queued && pathname === "/") {
      scrollToSection(queued);
      return;
    }

    scrollFromHash();
    const timer = window.setTimeout(scrollFromHash, 250);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollFromHash);
    return () => window.removeEventListener("hashchange", scrollFromHash);
  }, []);

  return null;
}
