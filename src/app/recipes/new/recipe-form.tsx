"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type IngredientRow = { name: string; quantity: number; unit: string };
type StepRow = { content: string };

export default function RecipeForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { name: "", quantity: 1, unit: "" },
  ]);
  const [steps, setSteps] = useState<StepRow[]>([{ content: "" }]);
  const [loading, setLoading] = useState(false);

  function addIngredient() {
    setIngredients((prev) => [...prev, { name: "", quantity: 1, unit: "" }]);
  }
  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateIngredient(i: number, field: keyof IngredientRow, value: string | number) {
    setIngredients((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function addStep() {
    setSteps((prev) => [...prev, { content: "" }]);
  }
  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateStep(i: number, content: string) {
    setSteps((prev) => {
      const next = [...prev];
      next[i] = { content };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const tagNames = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const categoryNames = categoryInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const ingFiltered = ingredients.filter((i) => i.name.trim());
    const stepsFiltered = steps.filter((s) => s.content.trim());

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || null,
        servings,
        prepTime: prepTime ? parseInt(prepTime, 10) : null,
        cookTime: cookTime ? parseInt(cookTime, 10) : null,
        tagNames,
        categoryNames,
        ingredients: ingFiltered.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit || null,
        })),
        steps: stepsFiltered.map((s) => ({ content: s.content })),
      }),
    });

    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      toast.error(err.error ?? "Erreur lors de la création");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as { slug: string };
    toast.success("Recette créée !");
    router.push(`/recipes/${data.slug}`);
  }

  const inputClass =
    "w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#2b2d2f] focus:border-[#2d6a4f] focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]";
  const labelClass = "block text-sm font-medium text-[#2b2d2f] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Titre</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="ex: Tarte aux pommes"
        />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Décris brièvement ta recette..."
        />
      </div>
      <div>
        <label className={labelClass}>Image (URL optionnelle)</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>Portions</label>
          <input
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Préparation (min)</label>
          <input
            type="number"
            min={0}
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </div>
        <div>
          <label className={labelClass}>Cuisson (min)</label>
          <input
            type="number"
            min={0}
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Tags (séparés par des virgules)</label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className={inputClass}
          placeholder="déjeuner, facile, végétarien"
        />
      </div>
      <div>
        <label className={labelClass}>Catégories (séparées par des virgules)</label>
        <input
          type="text"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          className={inputClass}
          placeholder="Entrée, Plat principal, Dessert"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelClass}>Ingrédients</label>
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm font-medium text-[#2d6a4f] hover:underline"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="number"
                min={0}
                step={0.5}
                value={ing.quantity || ""}
                onChange={(e) => updateIngredient(i, "quantity", parseFloat(e.target.value) || 0)}
                className="w-16 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                value={ing.unit}
                onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                className="w-20 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm"
                placeholder="g, ml..."
              />
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                className="flex-1 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm"
                placeholder="farine"
              />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="text-[#6b7280] hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelClass}>Étapes</label>
          <button
            type="button"
            onClick={addStep}
            className="text-sm font-medium text-[#2d6a4f] hover:underline"
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2d6a4f] text-xs font-medium text-white">
                {i + 1}
              </span>
              <textarea
                value={step.content}
                onChange={(e) => updateStep(i, e.target.value)}
                className="flex-1 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm"
                rows={2}
                placeholder="Décris cette étape..."
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="text-[#6b7280] hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#1b4332] disabled:opacity-60"
      >
        {loading ? "Publication..." : "Publier la recette"}
      </button>
    </form>
  );
}
