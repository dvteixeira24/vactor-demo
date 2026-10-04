import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted">
          Sign in to manage your profile, clips, and offers.
        </p>
      </header>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
