import type { Company } from "@demo/tenant-management-shared";
import type { Context } from "../types";
import { getCompanyModel } from "./getCompanyModel";
import type { CmsEntryListParams } from "@webiny/api-headless-cms/types";

type ListCompaniesParams = CmsEntryListParams;

export class ListCompanies {
    private readonly context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async execute(params: ListCompaniesParams): Promise<Company[]> {
        return this.context.tenancy.withRootTenant(async () => {
            return this.context.security.withoutAuthorization(async () => {
                const companyModel = await getCompanyModel(this.context);

                const [companyEntries] = await this.context.cms.listEntries(companyModel, {
                    ...params,
                    where: { ...params.where, latest: true }
                });

                return companyEntries.map(entry => {
                    return { id: entry.entryId, ...entry.values } as Company;
                });
            });
        });
    }
}
