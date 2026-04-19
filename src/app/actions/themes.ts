"use server";

import { revalidatePath } from "next/cache";
import { store } from "@/lib/data/store";
import type { ThemeTokens, WidgetTheme } from "@/lib/types";

export async function saveTheme(input: {
  id: string;
  name: string;
  description?: string;
  tokens: ThemeTokens;
}) {
  const idx = store.themes.findIndex((t) => t.id === input.id);
  if (idx === -1) return;
  const existing = store.themes[idx];
  const updated: WidgetTheme = {
    ...existing,
    name: input.name,
    description: input.description,
    tokens: input.tokens,
    updatedAt: new Date().toISOString(),
  };
  store.themes[idx] = updated;
  revalidatePath("/admin/themes");
  revalidatePath("/admin/widgets");
  revalidatePath("/");
}
