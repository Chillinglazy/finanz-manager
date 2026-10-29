"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/auth/actions";

type Props = {
  title: string;
  submitLabel: string;
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  switchText: string;
  switchHref: string;
  switchLabel: string;
};

export default function AuthForm({ title, submitLabel, action, switchText, switchHref, switchLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          E-Mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Passwort
          <input
            name="password"
            type="password"
            autoComplete={submitLabel === "Anmelden" ? "current-password" : "new-password"}
            required
            minLength={8}
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>
        {state.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}
        {state.message && <p className="text-sm text-green-700" role="status">{state.message}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Bitte warten …" : submitLabel}
        </button>
      </form>
      <p className="text-sm opacity-80">
        {switchText}{" "}
        <Link href={switchHref} className="font-medium text-emerald-700 underline dark:text-emerald-400">
          {switchLabel}
        </Link>
      </p>
    </main>
  );
}
