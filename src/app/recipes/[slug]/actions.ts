"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleLike(recipeId: string, recipeSlug: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return;

  const existing = await prisma.like.findUnique({
    where: {
      userId_recipeId: { userId: user.id, recipeId },
    },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: { userId: user.id, recipeId },
    });
  }

  revalidatePath(`/recipes/${recipeSlug}`);
}

export async function addComment(recipeId: string, recipeSlug: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const content = formData.get("content");
  if (!content || typeof content !== "string" || !content.trim()) return;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return;

  await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: user.id,
      recipeId,
    },
  });

  revalidatePath(`/recipes/${recipeSlug}`);
}

export async function deleteComment(commentId: string, recipeSlug: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user) return;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { recipe: true },
  });
  if (!comment) return;

  const isAdmin = user.role === "ADMIN";
  const isAuthor = comment.authorId === user.id;
  if (!isAdmin && !isAuthor) return;

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/recipes/${recipeSlug}`);
}
