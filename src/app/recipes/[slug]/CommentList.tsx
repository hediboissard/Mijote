"use client";

import CommentDeleteButton from "./CommentDeleteButton";

interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: { id: string; name: string | null; email: string | null };
  createdAt: Date;
}

interface Props {
  comments: Comment[];
  currentUserId?: string;
  currentUserRole?: string;
  recipeSlug: string;
}

export default function CommentList({
  comments,
  currentUserId,
  currentUserRole,
  recipeSlug,
}: Props) {
  const isAdmin = currentUserRole === "ADMIN";

  if (comments.length === 0) {
    return (
      <p className="text-sm text-[#6b7280]">
        Aucun commentaire pour le moment.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => {
        const canDelete =
          !!currentUserId &&
          (comment.authorId === currentUserId || isAdmin);

        return (
          <li
            key={comment.id}
            className="rounded-xl border border-[#E5E7EB]/50 bg-[#fdfcf7] p-3 text-sm text-[#2b2d2f]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#6b7280]">
                  <span className="font-medium text-[#2b2d2f]">
                    {comment.author.name ?? comment.author.email ?? "Anonyme"}
                  </span>
                  {" · "}
                  {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
              {canDelete && (
                <CommentDeleteButton
                  commentId={comment.id}
                  recipeSlug={recipeSlug}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
