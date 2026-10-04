import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Join Vactor
        </h1>
        <p className="text-sm text-muted">
          Build your voice portfolio and find your next role.
        </p>
      </header>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
