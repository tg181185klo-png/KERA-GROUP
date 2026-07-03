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
      <body className="flex min-h-screen items-center justify-center bg-[#f5f5f5] p-6 font-sans text-[#1a1a1a]">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">დაფიქსირდა შეცდომა</h1>
          <p className="mt-2 text-sm text-slate-600">
            {error.message || "გთხოვთ სცადოთ თავიდან."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-xl bg-[#ef7d00] px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
          >
            თავიდან ცდა
          </button>
        </div>
      </body>
    </html>
  );
}
