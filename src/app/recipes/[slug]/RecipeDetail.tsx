"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import MijoteLogo from "@/components/MijoteLogo";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import LikeButton from "./LikeButton";
import RecipeDeleteButton from "./RecipeDeleteButton";
import { toggleLike } from "./actions";

type RecipeData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  servings: number;
  prepTime: number | null;
  cookTime: number | null;
  authorId: string;
  author: { id: string; name: string | null; email: string | null; image: string | null };
  ingredients: { id: string; name: string; quantity: number; unit: string | null; order: number }[];
  steps: { id: string; content: string; order: number }[];
  tags: { tag: { id: string; name: string } }[];
  categories: { category: { id: string; name: string } }[];
  likes: { userId: string }[];
  comments: { id: string; content: string; authorId: string; author: { id: string; name: string | null; email: string | null }; createdAt: Date }[];
};

export default function RecipeDetail({
  recipe,
  isOwner,
  isLiked,
  sessionUserId,
}: {
  recipe: RecipeData;
  isOwner: boolean;
  isLiked: boolean;
  sessionUserId?: string;
}) {
  const [servings, setServings] = useState(recipe.servings);
  const factor = servings / recipe.servings;

  const formatQty = useCallback((qty: number) => {
    if (Number.isInteger(qty)) return String(qty);
    return qty.toFixed(1).replace(/\.0$/, "");
  }, []);

  return (
    <main className="min-h-screen bg-[#fdfcf7] px-4 py-10 font-sans text-[#2b2d2f]">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6b7280] hover:text-[#2d6a4f]"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux recettes
          </Link>
          <MijoteLogo size="sm" asLink />
        </div>

        <article className="rounded-2xl border border-[#E5E7EB]/50 bg-white/90 p-6 shadow-sm">
          {recipe.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="mb-6 max-h-80 w-full rounded-2xl object-cover"
            />
          )}

          <header className="space-y-2">
            <h1
              className="text-2xl font-semibold text-[#2b2d2f] sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {recipe.title}
            </h1>
            <p className="text-sm text-[#6b7280]">
              Par {recipe.author.name ?? recipe.author.email ?? "Anonyme"} ·{" "}
              {recipe.prepTime != null && `Préparation ${recipe.prepTime} min`}
              {recipe.prepTime != null && recipe.cookTime != null && " · "}
              {recipe.cookTime != null && `Cuisson ${recipe.cookTime} min`}
            </p>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((rt) => (
                <span
                  key={rt.tag.id}
                  className="rounded-full bg-[#f4a261]/20 px-2.5 py-0.5 text-xs font-medium text-[#e76f51]"
                >
                  {rt.tag.name}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm text-[#6b7280]">
              {sessionUserId ? (
                <LikeButton
                  isLiked={isLiked}
                  likesCount={recipe.likes.length}
                  action={() => toggleLike(recipe.id, recipe.slug)}
                />
              ) : (
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {recipe.likes.length} like{recipe.likes.length > 1 ? "s" : ""}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {recipe.comments.length} commentaire{recipe.comments.length > 1 ? "s" : ""}
              </span>
              {isOwner && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/recipes/${recipe.slug}/edit`}
                    className="text-[#2d6a4f] hover:underline"
                  >
                    Modifier
                  </Link>
                  <RecipeDeleteButton recipeSlug={recipe.slug} />
                </div>
              )}
            </div>
          </header>

          <div className="recipe-scroll prose prose-sm mt-6 max-w-none whitespace-pre-line text-[#2b2d2f] leading-relaxed">
            {recipe.description}
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#2b2d2f]">Ingrédients</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#6b7280]">Portions :</span>
                  <select
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-sm text-[#2b2d2f] focus:border-[#2d6a4f] focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
                  >
                    {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ul className="space-y-1.5 text-[#2b2d2f]">
                {[...recipe.ingredients]
                  .sort((a, b) => a.order - b.order)
                  .map((ing) => {
                    const scaledQty = ing.quantity * factor;
                    const hasQuantity =
                      ing.quantity != null &&
                      ing.quantity !== 0 &&
                      !Number.isNaN(ing.quantity);
                    const qtyStr = hasQuantity ? formatQty(scaledQty) : "";
                    const isRedundantOne =
                      hasQuantity &&
                      scaledQty === 1 &&
                      /^\d/.test(ing.name.trim());
                    return (
                      <li key={ing.id}>
                        {hasQuantity && !isRedundantOne && <strong>{qtyStr}</strong>}
                        {hasQuantity && !isRedundantOne && (ing.unit || ing.name) && " "}
                        {ing.unit && `${ing.unit} `}
                        {ing.name}
                      </li>
                    );
                  })}
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-[#2b2d2f]">Étapes</h2>
              <ol className="space-y-3 text-[#2b2d2f] leading-relaxed">
                {[...recipe.steps]
                  .sort((a, b) => a.order - b.order)
                  .map((step, idx) => (
                    <li key={step.id} className="flex gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#2d6a4f] text-xs font-medium text-white">
                        {idx + 1}
                      </span>
                      <span>{step.content}</span>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
