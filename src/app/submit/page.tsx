import type { Metadata } from "next";
import { PropertySubmitForm } from "@/components/submit/PropertySubmitForm";

export const metadata: Metadata = {
  title: "ქონების განთავსება | KERA GROUP",
  description:
    "განათავსეთ თქვენი უძრავი ქონება KERA GROUP-ის პრემიუმ პლატფორმაზე.",
};

export default function SubmitPage() {
  return (
    <section className="bg-kera-page py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-kera-primary">
            Property Listing
          </p>
          <h1 className="font-display mt-3 text-2xl font-bold text-kera-slate sm:text-3xl">
            ქონების განთავსება
          </h1>
          <p className="mt-3 text-slate-600">
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
