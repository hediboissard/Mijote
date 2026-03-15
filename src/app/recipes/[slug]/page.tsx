import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RecipeDetail from "./RecipeDetail";
import RecipeComments from "./RecipeComments";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string })?.id;
  const sessionUserRole = (session?.user as { role?: string })?.role;

  const recipe = await prisma.recipe.findUnique({
    where: { slug, published: true },
    include: {
      author: true,
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
      likes: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: true },
      },
    },
  });

  if (!recipe) notFound();

  const isAdmin = sessionUserRole === "ADMIN";
  const isOwner =
    !!sessionUserId &&
    (recipe.authorId === sessionUserId || isAdmin);
  const isLiked =
    !!sessionUserId &&
    recipe.likes.some((l: { userId: string }) => l.userId === sessionUserId);

  return (
    <div className="min-h-screen">
      <RecipeDetail
        recipe={recipe}
        isOwner={isOwner}
        isLiked={isLiked}
        sessionUserId={sessionUserId}
      />
      <div className="mx-auto max-w-3xl px-4 -mt-4 pb-10">
        <RecipeComments
          recipeId={recipe.id}
          recipeSlug={recipe.slug}
          comments={recipe.comments}
        />
      </div>
    </div>
  );
}
