"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  recipeSlug: string;
}

export default function RecipeDeleteButton({ recipeSlug }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    try {
      const res = await fetch(`/api/recipes/${recipeSlug}`, { method: "DELETE" });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        toast.error(err.error ?? "Impossible de supprimer la recette");
        return;
      }
      setIsOpen(false);
      toast.success("Recette supprimée");
      router.push("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm text-red-500 hover:text-red-600 hover:underline"
      >
        Supprimer
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="absolute inset-0 bg-[#2b2d2f]/50 backdrop-blur-sm"
            onClick={() => !isPending && setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
            <h2
              id="delete-modal-title"
              className="text-lg font-semibold text-[#2b2d2f]"
            >
              Supprimer la recette ?
            </h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              Cette action est irréversible. La recette et tous ses commentaires
              seront définitivement supprimés.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => !isPending && setIsOpen(false)}
                disabled={isPending}
                className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#2b2d2f] hover:bg-[#E5E7EB]/50 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
              >
                {isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
