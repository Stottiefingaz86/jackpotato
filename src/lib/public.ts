import {
  getCampaign,
  getTheme,
  getTiersForCampaign,
  getBrand,
  getWidget,
} from "@/lib/data/store";
import { resolveTheme } from "@/lib/theme";
import type { LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens } from "@/lib/types";

export function buildLiveCampaign(campaignId: string): LiveCampaign | null {
  const campaign = getCampaign(campaignId);
  if (!campaign) return null;
  const tiers = getTiersForCampaign(campaign.id).map((t) => ({
    tierId: t.id,
    name: t.name,
    displayLabel: t.displayLabel,
    splitPercent: t.splitPercent,
    currentAmount: t.currentAmount,
    mustDropAmount: t.mustDropAmount,
    mustDropAt: t.mustDropAt ?? null,
    color: t.color,
  }));
  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      currency: campaign.currency,
      type: campaign.type,
      description: campaign.description,
    },
    tiers,
  };
}

export function buildThemeForWidget(widgetId: string): ThemeTokens | null {
  const widget = getWidget(widgetId);
  if (!widget) return null;
  const brand = getBrand(widget.brandId);
  const widgetTheme = getTheme(widget.themeId);
  const brandTheme = brand ? getTheme(brand.defaultThemeId) : null;
  return resolveTheme({
    tenantDefault: null,
    brandDefault: brandTheme ?? null,
    widgetTheme,
    widgetOverrides: widget.themeOverrides,
  });
}

export function buildThemeForBrand(brandId: string): ThemeTokens | null {
  const brand = getBrand(brandId);
  if (!brand) return null;
  const brandTheme = getTheme(brand.defaultThemeId);
  return resolveTheme({ brandDefault: brandTheme });
}

export function buildThemeById(themeId: string): ThemeTokens | null {
  const theme = getTheme(themeId);
  if (!theme) return null;
  return resolveTheme({ widgetTheme: theme });
}
