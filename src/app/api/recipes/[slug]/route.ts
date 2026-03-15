import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = (await req.json()) as {
    title?: string;
    description?: string;
    imageUrl?: string | null;
    servings?: number;
    prepTime?: number | null;
    cookTime?: number | null;
    ingredients?: { name: string; quantity: number; unit?: string | null }[];
    steps?: { content: string }[];
    tagNames?: string[];
    categoryNames?: string[];
  };

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: { author: true },
  });
  if (!recipe) {
    return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });
  }
  const editor = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!editor) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const isAdmin = editor.role === "ADMIN";
  const isAuthor = recipe.authorId === editor.id;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json(
      { error: "Vous ne pouvez modifier que vos propres recettes" },
      { status: 403 },
    );
  }

  const tagIds: string[] = [];
  for (const name of body.tagNames ?? []) {
    if (typeof name !== "string" || !name.trim()) continue;
    const tag = await prisma.tag.upsert({
      where: { name: name.trim().toLowerCase() },
      create: { name: name.trim().toLowerCase() },
      update: {},
    });
    tagIds.push(tag.id);
  }

  const categoryIds: string[] = [];
  for (const name of body.categoryNames ?? []) {
    if (!name.trim()) continue;
    const cat = await prisma.category.upsert({
      where: { name: name.trim().toLowerCase() },
      create: { name: name.trim().toLowerCase() },
      update: {},
    });
    categoryIds.push(cat.id);
  }

  await prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.description && { description: body.description.trim() }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.servings != null && { servings: body.servings }),
      ...(body.prepTime !== undefined && { prepTime: body.prepTime }),
      ...(body.cookTime !== undefined && { cookTime: body.cookTime }),
    },
  });

  if (body.ingredients) {
    await prisma.ingredient.deleteMany({ where: { recipeId: recipe.id } });
    await prisma.ingredient.createMany({
      data: body.ingredients.map((ing, idx) => ({
        recipeId: recipe.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit ?? null,
        order: idx,
      })),
    });
  }
  if (body.steps) {
    await prisma.step.deleteMany({ where: { recipeId: recipe.id } });
    await prisma.step.createMany({
      data: body.steps.map((s, idx) => ({
        recipeId: recipe.id,
        content: s.content,
        order: idx,
      })),
    });
  }
  if (body.tagNames) {
    await prisma.recipeTag.deleteMany({ where: { recipeId: recipe.id } });
    if (tagIds.length > 0) {
      await prisma.recipeTag.createMany({
        data: tagIds.map((tagId) => ({ recipeId: recipe.id, tagId })),
      });
    }
  }
  if (body.categoryNames) {
    await prisma.recipeCategory.deleteMany({ where: { recipeId: recipe.id } });
    if (categoryIds.length > 0) {
      await prisma.recipeCategory.createMany({
        data: categoryIds.map((categoryId) => ({ recipeId: recipe.id, categoryId })),
      });
    }
  }

  const updated = await prisma.recipe.findUnique({
    where: { id: recipe.id },
  });
  return NextResponse.json({ slug: updated?.slug ?? slug });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: { author: true },
  });
  if (!recipe) {
    return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const isAdmin = user.role === "ADMIN";
  const isAuthor = recipe.authorId === user.id;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json(
      { error: "Vous ne pouvez supprimer que vos propres recettes" },
      { status: 403 },
    );
  }

  await prisma.recipe.delete({ where: { id: recipe.id } });
  return NextResponse.json(null, { status: 204 });
}
