"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToHash() {
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;

  const id = decodeURIComponent(hash.slice(1));
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    scrollToHash();
    const timer = window.setTimeout(scrollToHash, 200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
