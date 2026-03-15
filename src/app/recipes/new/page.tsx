import Link from "next/link";
import { redirect } from "next/navigation";
import MijoteLogo from "@/components/MijoteLogo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RecipeForm from "./recipe-form";

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <main className="min-h-screen bg-[#fdfcf7] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-[#6b7280] hover:text-[#2d6a4f]"
          >
            ← Retour à l&apos;accueil
          </Link>
          <MijoteLogo size="sm" asLink />
        </div>
        <h1 className="mb-6 text-2xl font-semibold text-[#2b2d2f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Nouvelle recette
        </h1>
        <RecipeForm />
      </div>
    </main>
  );
}
