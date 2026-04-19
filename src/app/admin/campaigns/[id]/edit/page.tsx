import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { CampaignForm } from "@/components/admin/campaign-form";
import { getCurrentTenantId } from "@/lib/session";
import {
  getBrandsForTenant,
  getCampaign,
  getTiersForCampaign,
} from "@/lib/data/store";
import type { CampaignFormInput } from "@/app/actions/campaigns";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenantId = await getCurrentTenantId();
  const campaign = getCampaign(id);
  if (!campaign) notFound();
  const brands = getBrandsForTenant(tenantId);
  const tiers = getTiersForCampaign(id);

  const initial: CampaignFormInput = {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    type: campaign.type,
    status: campaign.status,
    currency: campaign.currency,
    contributionRate: campaign.contributionRate,
    seedAmount: campaign.seedAmount,
    resetAmount: campaign.resetAmount,
    brandIds: campaign.brandIds,
    mustDropEnabled: !!campaign.rules.mustDropEnabled,
    maxDropIntervalSeconds: campaign.rules.maxDropIntervalSeconds,
    tiers: tiers.map((t) => ({
      id: t.id,
      name: t.name,
      displayLabel: t.displayLabel,
      splitPercent: t.splitPercent,
      seedAmount: t.seedAmount,
      resetAmount: t.resetAmount,
      mustDropAmount: t.mustDropAmount,
      color: t.color,
    })),
  };

  return (
    <>
      <PageHeader
        title={`Edit — ${campaign.name}`}
        description="Update campaign configuration, tiers and must-drop behavior."
      />
      <CampaignForm initial={initial} brands={brands} />
    </>
  );
}
