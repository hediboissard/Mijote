"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  recipeId: string;
  recipeSlug: string;
}

export default function CommentForm({ recipeId, recipeSlug }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsPending(true);
    try {
      const { addComment } = await import("./actions");
      await addComment(recipeId, recipeSlug, formData);
      formRef.current?.reset();
      toast.success("Commentaire publié");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-2"
    >
      <textarea
        name="content"
        required
        rows={3}
        placeholder="Écris ton commentaire..."
        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#2b2d2f] placeholder:text-[#6b7280] focus:border-[#2d6a4f] focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#1b4332] disabled:opacity-60"
      >
        {isPending ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
