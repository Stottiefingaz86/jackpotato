import { PageHeader } from "@/components/admin/page-header";
import { ApiKeyManager } from "@/components/admin/api-key-manager";
import { getCurrentTenantId } from "@/lib/session";
import { getApiKeysForTenant } from "@/lib/data/store";

export default async function KeysPage() {
  const tenantId = await getCurrentTenantId();
  const keys = getApiKeysForTenant(tenantId);
  return (
    <>
      <PageHeader
        title="API keys"
        description="Keys authenticate server-to-server event ingestion and public widget rendering. Rotate often."
      />
      <ApiKeyManager initialKeys={keys} />
    </>
  );
}
