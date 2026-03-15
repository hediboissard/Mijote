import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      likes: true,
      comments: true,
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
  });

  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
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

  if (!body.title?.trim() || !body.description?.trim()) {
    return NextResponse.json(
      { error: "Titre et description requis" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 400 });
  }

  const baseSlug = slugify(body.title);
  let slug = baseSlug;
  let i = 1;
  while (true) {
    const existing = await prisma.recipe.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${i++}`;
  }

  const tagIds: string[] = [];
  for (const name of body.tagNames ?? []) {
    if (!name.trim()) continue;
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

  const recipe = await prisma.recipe.create({
    data: {
      title: body.title.trim(),
      description: body.description.trim(),
      imageUrl: body.imageUrl ?? null,
      servings: body.servings ?? 4,
      prepTime: body.prepTime ?? null,
      cookTime: body.cookTime ?? null,
      slug,
      authorId: user.id,
      ingredients: {
        create: (body.ingredients ?? []).map((ing, idx) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit ?? null,
          order: idx,
        })),
      },
      steps: {
        create: (body.steps ?? []).map((step, idx) => ({
          content: step.content,
          order: idx,
        })),
      },
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  return NextResponse.json({ slug: recipe.slug });
}
