import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: { id: string; name: string | null; email: string | null };
  createdAt: Date;
}

interface Props {
  recipeId: string;
  recipeSlug: string;
  comments: Comment[];
}

export default async function RecipeComments({
  recipeId,
  recipeSlug,
  comments,
}: Props) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as { id?: string })?.id;
  const currentUserRole = (session?.user as { role?: string })?.role;

  return (
    <section className="mt-8 space-y-4 rounded-2xl border border-[#E5E7EB]/50 bg-white/90 p-6">
      <h2 className="text-lg font-semibold text-[#2b2d2f]">
        Commentaires ({comments.length})
      </h2>

      {session ? (
        <CommentForm recipeId={recipeId} recipeSlug={recipeSlug} />
      ) : (
        <p className="text-sm text-[#6b7280]">
          Connecte-toi pour laisser un commentaire.
        </p>
      )}

      <CommentList
        comments={comments}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        recipeSlug={recipeSlug}
      />
    </section>
  );
}
