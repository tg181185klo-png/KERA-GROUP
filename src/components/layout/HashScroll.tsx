"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function scrollToHash() {
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;

  const id = decodeURIComponent(hash.slice(1));

  if (id === "currency") {
    window.location.replace("/currency");
    return;
  }

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function HashScroll() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash === "#currency" && pathname !== "/currency") {
      router.replace("/currency");
      return;
    }

    scrollToHash();
    const timer = window.setTimeout(scrollToHash, 200);
    return () => window.clearTimeout(timer);
  }, [pathname, router]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
