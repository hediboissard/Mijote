import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MijoteLogo from "@/components/MijoteLogo";
import RecipeEditForm from "./recipe-edit-form";
import RecipeDeleteButton from "../RecipeDeleteButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditRecipePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      author: true,
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
  });

  if (!recipe) notFound();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user) redirect("/login");
  const isAdmin = user.role === "ADMIN";
  const isAuthor = recipe.authorId === user.id;
  if (!isAdmin && !isAuthor) redirect("/");

  return (
    <main className="min-h-screen bg-[#fdfcf7] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/recipes/${recipe.slug}`}
            className="text-sm font-medium text-[#6b7280] hover:text-[#2d6a4f]"
          >
            ← Retour à la recette
          </Link>
          <MijoteLogo size="sm" asLink />
        </div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#2b2d2f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Modifier la recette
          </h1>
          <RecipeDeleteButton recipeSlug={recipe.slug} />
        </div>
        <RecipeEditForm recipe={recipe} />
      </div>
    </main>
  );
}
