import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type PostWithRelations = Awaited<
  ReturnType<
    typeof prisma.post.findMany<{
      where: { published: boolean };
      orderBy: { createdAt: "desc" };
      include: { author: true; likes: true; comments: true };
    }>
  >
>[number];

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      likes: true,
      comments: true,
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 py-10 font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              PostForge · Blog créatif
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Forge tes idées en articles.
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Publie, like et commente des posts.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 text-sm">
            {session ? (
              <>
                <span className="max-w-[220px] text-right text-xs text-zinc-500">
                  Connecté en tant que{" "}
                  <span className="font-medium">
                    {session.user?.name ?? session.user?.email}
                  </span>
                </span>
                <div className="flex gap-2">
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/api/auth/signout"
                    className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    Se déconnecter
                  </Link>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Se connecter
              </Link>
            )}
          </div>
        </header>

        <section className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Articles récents</h2>
            <p className="text-xs text-zinc-500">
              {posts.length === 0
                ? "Aucun article pour le moment."
                : `${posts.length} article${
                    posts.length > 1 ? "s" : ""
                  } publiés récemment.`}
            </p>
          </div>
          {session && (
            <Link
              href="/posts/new"
              className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              + Nouvel article
            </Link>
          )}
        </section>

        <section className="space-y-4">
          {posts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60">
              {session ? (
                <p>
                  Aucun article publié pour l&apos;instant. Sois le premier à
                  partager quelque chose depuis le bouton{" "}
                  <span className="font-medium">“+ Nouvel article”</span>.
                </p>
              ) : (
                <p>
                  Aucun article publié pour l&apos;instant. Connecte-toi pour
                  commencer à écrire.
                </p>
              )}
            </div>
          )}

          <ul className="space-y-3">
            {posts.map((post: PostWithRelations) => (
              <li
                key={post.id}
                className="group rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-900 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <Link href={`/posts/${post.slug}`}>
                  <div className="flex items-start gap-4">
                    {post.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex flex-1 items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold group-hover:underline">
                          {post.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                          {post.content}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          Par{" "}
                          <span className="font-medium">
                            {post.author?.name ??
                              post.author?.email ??
                              "Auteur"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 whitespace-nowrap">
                        <span>❤️ {post.likes.length}</span>
                        <span>💬 {post.comments.length}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
