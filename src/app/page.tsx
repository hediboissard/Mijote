import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import MijoteLogo from "@/components/MijoteLogo";
import RecipeFilters from "@/components/RecipeFilters";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RecipeCard = Awaited<
  ReturnType<
    typeof prisma.recipe.findMany<{
      where: { published: true };
      include: { author: true; likes: true; comments: true; tags: { include: { tag: true } }; categories: { include: { category: true } } };
    }>
  >
>[number];

/** Temps total = préparation + cuisson (en minutes) */
function getTotalTime(recipe: { prepTime: number | null; cookTime: number | null }) {
  return (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; time?: string; category?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string })?.id;

  const searchRaw = params.search;
  const search = (typeof searchRaw === "string" ? searchRaw : searchRaw?.[0] ?? "").trim().toLowerCase();
  const timeRaw = params.time;
  const timeFilter = typeof timeRaw === "string" ? timeRaw : timeRaw?.[0] ?? "";
  const categoryRaw = params.category;
  const categoryFilter = typeof categoryRaw === "string" ? categoryRaw : categoryRaw?.[0] ?? "";

  const whereClause = {
    published: true as const,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        {
          tags: {
            some: {
              tag: { name: { contains: search, mode: "insensitive" as const } },
            },
          },
        },
      ],
    }),
    ...(categoryFilter && {
      categories: {
        some: {
          category: {
            name: { equals: categoryFilter, mode: "insensitive" as const },
          },
        },
      },
    }),
  };

  const categories = await prisma.category.findMany({
    where: {
      recipes: {
        some: { recipe: { published: true } },
      },
    },
    orderBy: { name: "asc" },
    select: { name: true },
  });

  let recipes = await prisma.recipe.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      likes: true,
      comments: true,
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
  });

  if (timeFilter) {
    recipes = recipes.filter((r) => {
      const total = getTotalTime(r);
      switch (timeFilter) {
        case "rapide":
          return total <= 30; // inclut les recettes sans temps (0 min)
        case "moyen":
          return total > 30 && total <= 60;
        case "long":
          return total > 60;
        default:
          return true;
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#fdfcf7] px-4 py-10 font-sans text-[#2b2d2f]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-6 rounded-2xl border border-[#E5E7EB]/50 bg-white/80 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] bg-[#fdfcf7] px-3 py-1.5">
              <MijoteLogo size="sm" asLink />
            </div>
            <h1 className="font-recipe-title text-2xl font-semibold tracking-tight text-[#2b2d2f] sm:text-3xl" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Découvre des recettes.
            </h1>
            <p className="text-sm text-[#6b7280]">
              Parcours les recettes publiées par la communauté.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 text-sm">
            {session ? (
              <>
                <span className="max-w-[220px] text-right text-xs text-[#6b7280]">
                  Connecté en tant que{" "}
                  <span className="font-medium">
                    {session.user?.name ?? session.user?.email}
                  </span>
                </span>
                <div className="flex gap-2">
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#2b2d2f] hover:bg-[#E5E7EB]/50"
                  >
                    Tableau de bord
                  </Link>
                  <Link
                    href="/recipes/new"
                    className="rounded-full bg-[#2d6a4f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1b4332]"
                  >
                    + Nouvelle recette
                  </Link>
                  <Link
                    href="/api/auth/signout"
                    className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium hover:bg-[#E5E7EB]/50"
                  >
                    Se déconnecter
                  </Link>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[#2d6a4f] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#1b4332]"
              >
                Se connecter
              </Link>
            )}
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#2b2d2f]">Recettes récentes</h2>
              <p className="text-xs text-[#6b7280]">
                {recipes.length === 0
                  ? "Aucune recette pour le moment."
                  : `${recipes.length} recette${recipes.length > 1 ? "s" : ""} trouvée${recipes.length > 1 ? "s" : ""}.`}
              </p>
            </div>
            {session && (
              <Link
                href="/recipes/new"
                className="rounded-full bg-[#2d6a4f] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#1b4332]"
              >
                + Nouvelle recette
              </Link>
            )}
          </div>
          <Suspense fallback={<div className="h-10 animate-pulse rounded-full bg-[#E5E7EB]/50" />}>
            <RecipeFilters categories={categories.map((c) => c.name)} />
          </Suspense>
        </section>

        <section className="space-y-4">
          {recipes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white/60 p-6 text-sm text-[#6b7280]">
              {search || timeFilter || categoryFilter ? (
                <p>
                  Aucune recette ne correspond à tes critères. Essaie d&apos;autres mots-clés
                  ou un autre filtre de temps.
                </p>
              ) : session ? (
                <p>
                  Aucune recette publiée pour l&apos;instant. Sois le premier à partager
                  une recette.
                </p>
              ) : (
                <p>
                  Aucune recette publiée pour l&apos;instant. Reviens bientôt ou connecte-toi
                  pour en ajouter une.
                </p>
              )}
            </div>
          )}

          <ul className="grid gap-4 sm:grid-cols-2">
            {recipes.map((recipe: RecipeCard) => {
              const sessionUserRole = (session?.user as { role?: string })?.role;
              const isAdmin = sessionUserRole === "ADMIN";
              const isOwner =
                !!sessionUserId &&
                (recipe.authorId === sessionUserId || isAdmin);
              return (
                <li key={recipe.id}>
                  <div className="group flex flex-col rounded-2xl border border-[#E5E7EB]/50 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2d6a4f]/30 hover:shadow-md">
                    <Link href={`/recipes/${recipe.slug}`} className="flex min-w-0 flex-1 items-start gap-4">
                      {recipe.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-recipe-title truncate text-base font-semibold text-[#2b2d2f] group-hover:text-[#2d6a4f]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                          {recipe.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-[#6b7280]">
                          {recipe.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {recipe.tags.slice(0, 3).map((rt) => (
                            <span
                              key={rt.tag.id}
                              className="rounded-full bg-[#f4a261]/20 px-2 py-0.5 text-[10px] font-medium text-[#e76f51]"
                            >
                              {rt.tag.name}
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-[#6b7280]">
                          Par {recipe.author?.name ?? recipe.author?.email ?? "Anonyme"}
                          {(recipe.prepTime != null || recipe.cookTime != null) && (
                            <> · {getTotalTime(recipe)} min total</>
                          )}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-[#6b7280]">
                          <span>❤️ {recipe.likes.length}</span>
                          <span>💬 {recipe.comments.length}</span>
                        </div>
                      </div>
                    </Link>
                    {isOwner && (
                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/recipes/${recipe.slug}/edit`}
                          className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#2d6a4f] hover:bg-[#2d6a4f]/10"
                        >
                          Modifier
                        </Link>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
