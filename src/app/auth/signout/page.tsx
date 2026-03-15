"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import MijoteLogo from "@/components/MijoteLogo";

export default function SignOutPage() {
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fdfcf7] px-4 font-sans text-[#2b2d2f]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#E5E7EB]/50 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="space-y-2">
            <MijoteLogo size="sm" asLink />
            <h1 className="font-recipe-title text-xl font-semibold tracking-tight text-[#2b2d2f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Se déconnecter ?
            </h1>
            <p className="text-sm text-[#6b7280]">
              {session?.user?.email
                ? `Tu es actuellement connecté en tant que ${session.user.email}.`
                : "Tu es actuellement connecté."}
              {" "}Tu peux revenir à l&apos;accueil à tout moment.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-full bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1b4332]"
            >
              Oui, me déconnecter
            </button>
            <Link
              href="/"
              className="w-full rounded-full border border-[#E5E7EB] px-4 py-2 text-center text-sm font-medium text-[#2b2d2f] transition hover:bg-[#E5E7EB]/50"
            >
              Non, retourner à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

