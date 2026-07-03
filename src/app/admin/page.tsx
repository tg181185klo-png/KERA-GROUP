"use client";

import { useEffect, useState } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-kera-page">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-kera-primary border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="bg-kera-page py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {authenticated ? (
          <AdminDashboard />
        ) : (
          <AdminLogin onSuccess={() => setAuthenticated(true)} />
        )}
      </div>
    </section>
  );
}
