import { InstallTenant } from "@webiny/api-serverless-cms";
import type { Tenant } from "@webiny/api-tenancy/types";
import { GetSettings, SaveSettings } from "@webiny/api-admin-settings";
import { WEBSITE_BUILDER_SETTINGS } from "@webiny/api-website-builder/constants";
import { parseIdentifier } from "@webiny/utils";

import type { Context } from "../types";
import { getCompanyModel } from "./getCompanyModel";
import { GetCompanyById } from "./GetCompanyById";

export class CreateAndInstallTenant {
    private readonly context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async execute(companyId: string) {
        const { id: entryId } = parseIdentifier(companyId);
        const { cms, tenancy } = this.context;

        const companyModel = await getCompanyModel(this.context);

        const company = await new GetCompanyById(this.context).execute(entryId);

        const tenant = await tenancy.createTenant({
            id: entryId,
            name: company.name,
            parent: "root",
            description: company.name,
            tags: []
        });

        const installTenant = new InstallTenant(this.context);
        await installTenant.execute(tenant, {
            i18n: {
                defaultLocaleCode: "en-US"
            }
        });

        // `entryId` doesn't contain a revision number, but CMS SDK requires a revision to update.
        // Since we're not publishing companies, we can safely append `#0001` to point to the first revision.
        await cms.updateEntry(companyModel, `${entryId}#0001`, { ...company, isInstalled: true });

        await this.updateWebsiteBuilderSettings(tenant);
    }

    private async updateWebsiteBuilderSettings(tenant: Tenant): Promise<void> {
        // Get Website Builder settings from `root` tenant
        const getSettings = GetSettings.create(this.context);
        const settings = await getSettings.execute(WEBSITE_BUILDER_SETTINGS);
        const data = settings.getData();

        // Update settings on the new tenant
        await this.context.tenancy.withTenant(tenant, () => {
            const saveSettings = SaveSettings.create(this.context);

            return saveSettings.execute({
                name: WEBSITE_BUILDER_SETTINGS,
                settings: data
            });
        });
    }
}
