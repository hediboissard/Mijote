"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Props {
  commentId: string;
  recipeSlug: string;
}

export default function CommentDeleteButton({ commentId, recipeSlug }: Props) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    try {
      const { deleteComment } = await import("./actions");
      await deleteComment(commentId, recipeSlug);
      toast.success("Commentaire supprimé");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={isPending}
        className="text-xs text-[#6b7280] hover:text-red-500 disabled:opacity-60"
      >
        {isPending ? "Suppression..." : "Supprimer"}
      </button>
    </form>
  );
}
