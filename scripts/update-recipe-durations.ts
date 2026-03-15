/**
 * Met à jour les durées des recettes curry (Rapide) et tarte aux pommes (Moyen)
 * Usage: npx tsx scripts/update-recipe-durations.ts
 */
import "dotenv/config";

import { prisma } from "../src/lib/prisma";

async function main() {
  // Curry -> Rapide (≤30 min total)
  const curryRecipes = await prisma.recipe.findMany({
    where: { title: { contains: "curry", mode: "insensitive" } },
  });
  for (const r of curryRecipes) {
    await prisma.recipe.update({
      where: { id: r.id },
      data: { prepTime: 15, cookTime: 15 },
    });
    console.log(`✓ "${r.title}" → Rapide (15+15 min)`);
  }

  // Tarte aux pommes -> Moyen (30-60 min)
  const tarteRecipes = await prisma.recipe.findMany({
    where: {
      AND: [
        { title: { contains: "tarte", mode: "insensitive" } },
        { title: { contains: "pomme", mode: "insensitive" } },
      ],
    },
  });
  for (const r of tarteRecipes) {
    await prisma.recipe.update({
      where: { id: r.id },
      data: { prepTime: 25, cookTime: 35 },
    });
    console.log(`✓ "${r.title}" → Moyen (25+35 min)`);
  }

  const total = curryRecipes.length + tarteRecipes.length;
  if (total === 0) {
    console.log("Aucune recette trouvée (curry ou tarte aux pommes).");
  } else {
    console.log(`\n${total} recette(s) mise(s) à jour.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
