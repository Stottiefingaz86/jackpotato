import { PageHeader } from "@/components/admin/page-header";
import { ThemeEditor } from "@/components/admin/theme-editor";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCampaignsForTenant,
  getThemesForTenant,
  store,
} from "@/lib/data/store";
import { buildLiveCampaign } from "@/lib/public";

export default async function ThemesPage() {
  const tenantId = await getCurrentTenantId();
  const ownThemes = getThemesForTenant(tenantId);
  // Preset panel shows the full shared catalog so operators can start from any
  // house style. Their own themes float to the top so edits feel "mine".
  const otherThemes = store.themes.filter((t) => t.tenantId !== tenantId);
  const themes = [...ownThemes, ...otherThemes];
  const campaigns = getCampaignsForTenant(tenantId);
  const live = buildLiveCampaign(campaigns[0]?.id ?? "")!;

  return (
    <>
      <PageHeader
        title="Themes"
        description="Visual tokens that cascade from platform → tenant → brand → widget. Every widget reacts to edits in real time."
      />
      <ThemeEditor
        themes={themes}
        initial={ownThemes[0] ?? themes[0]}
        live={live}
      />
    </>
  );
}
