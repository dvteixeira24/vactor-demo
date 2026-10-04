"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/auth/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = isSignup
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Something went wrong. Try again.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {isSignup && (
        <Field
          label="Display name"
          type="text"
          value={name}
          onChange={setName}
          autoComplete="name"
          placeholder="Jordan Rivera"
          required
        />
      )}
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        placeholder="you@studio.com"
        required
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete={isSignup ? "new-password" : "current-password"}
        placeholder={isSignup ? "At least 8 characters" : "Your password"}
        required
        minLength={isSignup ? 8 : undefined}
      />

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex h-11 items-center justify-center rounded-pill bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New to Vactor? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-accent hover:text-accent-hover"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
      />
    </label>
  );
}
