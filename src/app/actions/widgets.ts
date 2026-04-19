"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentTenantId } from "@/lib/session";
import { getWidget, nextId, store } from "@/lib/data/store";
import { bus } from "@/lib/bus";
import type { Widget, WidgetConfig, WidgetStatus, WidgetType } from "@/lib/types";

export interface WidgetFormInput {
  id?: string;
  name: string;
  type: WidgetType;
  brandId: string;
  campaignId: string;
  themeId: string;
  status: WidgetStatus;
  config: WidgetConfig;
}

export async function saveWidget(input: WidgetFormInput) {
  const tenantId = await getCurrentTenantId();
  const now = new Date().toISOString();

  let widget: Widget;
  if (input.id) {
    const existing = getWidget(input.id);
    if (!existing) throw new Error("Widget not found");
    widget = {
      ...existing,
      name: input.name,
      type: input.type,
      brandId: input.brandId,
      campaignId: input.campaignId,
      themeId: input.themeId,
      status: input.status,
      config: input.config,
      updatedAt: now,
    };
    const idx = store.widgets.findIndex((w) => w.id === widget.id);
    store.widgets[idx] = widget;
  } else {
    widget = {
      id: nextId("wdg"),
      tenantId,
      brandId: input.brandId,
      campaignId: input.campaignId,
      name: input.name,
      type: input.type,
      themeId: input.themeId,
      status: input.status,
      config: input.config,
      createdAt: now,
      updatedAt: now,
    };
    store.widgets.push(widget);
  }

  bus.publish({
    type: "widget.updated",
    widgetId: widget.id,
    timestamp: now,
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  redirect(`/admin/widgets/${widget.id}`);
}

export async function deleteWidget(id: string) {
  store.widgets = store.widgets.filter((w) => w.id !== id);
  revalidatePath("/admin/widgets");
  redirect("/admin/widgets");
}
