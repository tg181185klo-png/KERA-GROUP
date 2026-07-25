"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ka">
      <body className="flex min-h-screen items-center justify-center overflow-x-hidden bg-kera-page p-6 font-sans text-kera-slate antialiased">
        <div className="kera-card max-w-md p-8 text-center">
          <h1 className="kera-page-header text-xl">დაფიქსირდა შეცდომა</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {error.message || "გთხოვთ სცადოთ თავიდან."}
          </p>
          <button type="button" onClick={() => reset()} className="kera-btn mt-6">
            თავიდან ცდა
          </button>
        </div>
      </body>
    </html>
  );
}
