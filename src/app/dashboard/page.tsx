import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MijoteLogo from "@/components/MijoteLogo";

type UserWithRecipes = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.user.findUnique<{
        where: { email: string };
        include: {
          recipes: {
            orderBy: { createdAt: "desc" };
            include: { likes: true; comments: true };
          };
        };
      }>
    >
  >
>;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      recipes: {
        orderBy: { createdAt: "desc" },
        include: { likes: true, comments: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const typedUser = user as UserWithRecipes;
  const totalRecipes = typedUser.recipes.length;
  const totalLikes = typedUser.recipes.reduce(
    (acc, r) => acc + r.likes.length,
    0,
  );
  const totalComments = typedUser.recipes.reduce(
    (acc, r) => acc + r.comments.length,
    0,
  );

  return (
    <main className="min-h-screen bg-[#fdfcf7] px-4 py-10 font-sans text-[#2b2d2f]">
      <div className="mx-auto max-w-3xl flex flex-col gap-8">
        <header className="flex justify-between gap-4 rounded-2xl border border-[#E5E7EB]/50 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d6a4f] text-sm font-semibold text-white">
              {(user.name ?? user.email ?? "?")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#2d6a4f]">
                Tableau de bord
              </p>
              <h1 className="text-xl font-semibold sm:text-2xl">
                Salut, {user.name ?? user.email}
              </h1>
              <p className="text-xs text-[#6b7280]">
                {totalRecipes} recette
                {totalRecipes > 1 ? "s" : ""} publiée
                {totalRecipes > 1 ? "s" : ""} jusqu&apos;ici.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs sm:flex-row sm:items-center sm:gap-3">
            <Link href="/" className="hidden sm:block">
              <MijoteLogo size="sm" />
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[#E5E7EB] px-3 py-1.5 font-medium text-[#2b2d2f] hover:bg-[#E5E7EB]/50"
            >
              ← Accueil
            </Link>
            <Link
              href="/recipes/new"
              className="rounded-full bg-[#2d6a4f] px-4 py-2 text-xs font-medium text-white hover:bg-[#1b4332]"
            >
              + Nouvelle recette
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E7EB]/50 bg-white/90 p-4">
            <p className="text-xs text-[#6b7280]">Recettes publiées</p>
            <p className="mt-1 text-xl font-semibold">{totalRecipes}</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB]/50 bg-white/90 p-4">
            <p className="text-xs text-[#6b7280]">Likes reçus</p>
            <p className="mt-1 text-xl font-semibold">{totalLikes}</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB]/50 bg-white/90 p-4">
            <p className="text-xs text-[#6b7280]">Commentaires</p>
            <p className="mt-1 text-xl font-semibold">{totalComments}</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#2b2d2f]">
            Mes recettes
          </h2>
          {typedUser.recipes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white/80 p-6 text-sm text-[#6b7280]">
              Tu n&apos;as pas encore publié de recette. Clique sur{" "}
              <span className="font-medium">“+ Nouvelle recette”</span> pour
              commencer.
            </div>
          ) : (
            <ul className="space-y-3 text-sm">
              {typedUser.recipes.map((recipe) => (
                <li
                  key={recipe.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-[#E5E7EB]/50 bg-white/90 p-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="font-medium text-[#2b2d2f] hover:text-[#2d6a4f] hover:underline"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {recipe.title}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs text-[#6b7280]">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <Link
                        href={`/recipes/${recipe.slug}/edit`}
                        className="inline-flex rounded-full border border-[#E5E7EB] px-2.5 py-1 font-medium text-[#2b2d2f] hover:bg-[#E5E7EB]/50"
                      >
                        Modifier
                      </Link>
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className="inline-flex rounded-full border border-[#E5E7EB] px-2.5 py-1 font-medium text-[#6b7280] hover:bg-[#E5E7EB]/50"
                      >
                        Voir
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                    <span>❤️ {recipe.likes.length}</span>
                    <span>💬 {recipe.comments.length}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
