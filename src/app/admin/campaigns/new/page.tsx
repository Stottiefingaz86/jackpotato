import { PageHeader } from "@/components/admin/page-header";
import { CampaignForm } from "@/components/admin/campaign-form";
import { getCurrentTenantId } from "@/lib/session";
import { getBrandsForTenant } from "@/lib/data/store";

export default async function NewCampaignPage() {
  const tenantId = await getCurrentTenantId();
  const brands = getBrandsForTenant(tenantId);
  return (
    <>
      <PageHeader
        title="Create campaign"
        description="Configure a new progressive, must-drop or local jackpot. Tiers, contribution rate and eligible brands can be tuned any time."
      />
      <CampaignForm brands={brands} />
    </>
  );
}
