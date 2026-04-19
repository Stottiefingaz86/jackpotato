import { PageHeader } from "@/components/admin/page-header";
import { CrateForm } from "@/components/admin/crate-form";
import { getCurrentTenantId } from "@/lib/session";
import { getBrandsForTenant } from "@/lib/data/store";

export default async function NewCratePage() {
  const tenantId = await getCurrentTenantId();
  const brands = getBrandsForTenant(tenantId);

  return (
    <>
      <PageHeader
        title="New crate"
        description="Design a loot crate — pick an animation, set the unlock trigger, and balance the prize pool. Players see exactly what you build on the right."
      />
      <CrateForm brands={brands} />
    </>
  );
}
