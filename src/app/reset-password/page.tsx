import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--header-height)-8rem)] items-center justify-center px-4 py-12 sm:py-16">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
