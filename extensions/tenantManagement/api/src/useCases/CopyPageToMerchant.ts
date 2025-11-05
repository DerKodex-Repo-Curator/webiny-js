import type { Company } from "@demo/tenant-management-shared";
import type { WbPage } from "@webiny/api-website-builder/context/pages/pages.types.js";
import type { Context } from "../types";

export class CopyPageToMerchant {
    private readonly context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async execute(merchant: Company, page: WbPage): Promise<void> {
        const tenant = await this.context.tenancy.getTenantById(merchant.id);

        await this.context.tenancy.withTenant(tenant, async () => {
            const [[existingPage]] = await this.context.websiteBuilder.pages.list({
                where: { latest: true, entryId: page.entryId },
                limit: 1,
                sort: [],
                after: null
            });

            let newPage: WbPage;

            // Create a new page
            if (!existingPage) {
                // Create a new page
                const newPageData = structuredClone({
                    ...page,
                    id: page.entryId,
                    tenant: merchant.id,
                    wbyAco_location: { folderId: "root" },
                    version: undefined
                });
                newPage = await this.context.websiteBuilder.pages.create(newPageData);
                await this.context.websiteBuilder.pages.publish(newPage);

                return;
            }

            // Update existing page bt creating a new revision.
            newPage = await this.context.websiteBuilder.pages.createRevisionFrom({
                id: existingPage.id
            });

            newPage.properties = page.properties;
            newPage.bindings = page.bindings;
            newPage.metadata = page.metadata;
            newPage.elements = page.elements;
            newPage.status = "published";

            await this.context.websiteBuilder.pages.update(newPage.id, newPage);
        });
    }
}
