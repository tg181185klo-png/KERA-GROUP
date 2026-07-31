export const CURRENCY_SECTION_ID = "currency";

const SCROLL_KEY = "kera-scroll-to";

export function queueScrollToSection(id: string) {
  sessionStorage.setItem(SCROLL_KEY, id);
}

export function consumeScrollTarget(): string | null {
  const id = sessionStorage.getItem(SCROLL_KEY);
  if (id) sessionStorage.removeItem(SCROLL_KEY);
  return id;
}

function scrollToId(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
  return true;
}

export function scrollToSection(id: string, maxAttempts = 25) {
  if (scrollToId(id)) return;

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (scrollToId(id) || attempts >= maxAttempts) {
      window.clearInterval(timer);
    }
  }, 100);
}
