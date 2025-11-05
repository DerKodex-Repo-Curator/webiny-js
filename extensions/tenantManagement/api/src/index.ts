import { createCompanyModel } from "./storage/companyModel";
import { createModelGroup } from "./storage/contentModelGroup";
import { installTenant } from "./graphql/installTenant";
import { getCurrentCompany } from "./graphql/getCurrentCompany";
import { createUniversalKeyAuthentication } from "./authentication/apiKeyAuthentication";
import { copyPagesOnPublish } from "./copyPagesOnPublish/copyPagesOnPublish";

export const createExtension = () => {
    return [
        createModelGroup(),
        createCompanyModel(),
        installTenant(),
        getCurrentCompany(),
        createUniversalKeyAuthentication(),
        copyPagesOnPublish()
    ];
};
