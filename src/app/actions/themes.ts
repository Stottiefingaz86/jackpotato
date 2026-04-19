"use server";

import { revalidatePath } from "next/cache";
import { store } from "@/lib/data/store";
import { bus } from "@/lib/bus";
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

  // A theme swap can affect dozens of server-rendered pages: theme list,
  // every widget detail, the widgets grid, the landing preview, and any
  // route under the admin shell that reads from the store. Revalidate the
  // whole marketing root + entire admin layout so they all re-fetch.
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");

  // Broadcast a realtime event so any mounted widget currently streaming
  // from SSE can re-fetch its theme snapshot without a full page reload.
  const widgetsUsingTheme = store.widgets.filter((w) => w.themeId === input.id);
  for (const w of widgetsUsingTheme) {
    bus.publish({
      type: "widget.updated",
      widgetId: w.id,
      timestamp: new Date().toISOString(),
    });
  }
}
