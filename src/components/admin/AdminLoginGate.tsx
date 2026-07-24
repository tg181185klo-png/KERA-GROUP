"use client";

import { AdminLogin } from "@/components/admin/AdminLogin";

export function AdminLoginGate() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <AdminLogin onSuccess={() => window.location.reload()} />
    </div>
  );
}
