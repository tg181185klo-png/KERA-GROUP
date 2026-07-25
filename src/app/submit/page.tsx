import type { Metadata } from "next";
import { PropertySubmitForm } from "@/components/submit/PropertySubmitForm";

export const metadata: Metadata = {
  title: "ქონების განთავსება | KERA GROUP",
  description:
    "განათავსეთ თქვენი უძრავი ქონება KERA GROUP-ის პრემიუმ პლატფორმაზე.",
};

export default function SubmitPage() {
  return (
    <section className="kera-section bg-kera-page">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="kera-eyebrow">Property Listing</p>
          <h1 className="kera-section-title mt-3">ქონების განთავსება</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
            განათავსეთ თქვენი უძრავი ქონება KERA GROUP-ის პრემიუმ პლატფორმაზე.
            განცხადება მოდერაციის შემდეგ გამოჩნდება საიტზე.
          </p>
        </div>

        <div className="kera-card p-6 sm:p-8">
          <PropertySubmitForm />
        </div>
      </div>
    </section>
  );
}
