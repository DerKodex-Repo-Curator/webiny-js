import { createContextPlugin } from "@webiny/api-serverless-cms";
import { ListCompanies } from "../useCases/ListCompanies";
import { CopyPageToMerchant } from "../useCases/CopyPageToMerchant";

export const copyPagesOnPublish = () => {
    return createContextPlugin(context => {
        context.websiteBuilder.pages.onPageAfterPublish.subscribe(async ({ page }) => {
            const tenant = context.tenancy.getCurrentTenant();
            if (tenant.id !== "root") {
                // We only propagate pages from root tenant to subtenants.
                return;
            }

            const merchantTypes = page.properties.merchantTypes as string[];

            const listCompanies = new ListCompanies(context);

            const merchants = await listCompanies.execute({
                where: { merchantType_in: merchantTypes }
            });

            try {
                await context.security.withoutAuthorization(async () => {
                    for (const merchant of merchants) {
                        const copyPageToMerchant = new CopyPageToMerchant(context);
                        await copyPageToMerchant.execute(merchant, page);
                    }
                });
            } catch (err) {
                console.error("Failed to propagate page", err);
            }
        });
    });
};
