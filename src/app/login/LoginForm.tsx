"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import MijoteLogo from "@/components/MijoteLogo";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "Callback") {
      toast.error(
        "Connexion Google impossible. Réessaie ou utilise ton email/mot de passe.",
      );
    }
  }, [searchParams]);

  async function handleCredentialsSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/",
    });

    if (res?.error || !res?.ok) {
      const msg = "Identifiants invalides";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    toast.success("Connexion réussie");
    router.push("/");
    router.refresh();
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <MijoteLogo size="md" asLink />
        </div>
        <h1 className="text-2xl font-semibold text-[#2b2d2f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Se connecter
        </h1>

        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/",
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Continuer avec Google
        </button>
        <Link
          href="/register"
          className="flex w-full items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Créer un compte
        </Link>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          <span>ou</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {loading ? "Connexion..." : "Continuer avec email"}
          </button>
        </form>

        <p className="text-xs text-zinc-500">
          Pas encore de compte ? Tu peux en créer un avec ton email ci-dessus, via{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Google
          </span>
          , ou via la page d&apos;inscription.
        </p>
      </div>
    </main>
  );
}
