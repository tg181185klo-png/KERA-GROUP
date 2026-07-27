import type { Metadata } from "next";
import { SubmitPageContent } from "@/components/submit/SubmitPageContent";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale);

  return {
    title: `${t.submit.title} | ${t.brand.tagline}`,
    description: t.submit.subtitle,
  };
}

export default function SubmitPage() {
  return <SubmitPageContent />;
}
