"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import MijoteLogo from "@/components/MijoteLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        toast.error(
          data?.error ?? "Impossible de créer le compte. Réessaie plus tard.",
        );
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/",
      });

      if (signInResult?.error) {
        toast.error("Compte créé mais connexion échouée. Connecte-toi manuellement.");
        router.push("/login");
        setLoading(false);
        return;
      }

      toast.success("Compte créé ! Tu es connecté.");
      router.refresh();
      router.push("/");
    } catch {
      toast.error("Erreur inattendue. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 py-10 font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="space-y-2">
            <MijoteLogo size="sm" asLink />
            <h1 className="text-xl font-semibold tracking-tight">
              Créer un compte
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Rejoins le blog et commence à publier tes propres articles.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Nom (optionnel)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
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
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
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

            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {loading ? "Création du compte..." : "Créer un compte"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Tu as déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

