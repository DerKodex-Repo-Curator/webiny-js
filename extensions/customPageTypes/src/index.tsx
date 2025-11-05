import React from "react";
import { AdminConfig } from "@webiny/app-admin";
import { PageListConfig } from "@webiny/app-website-builder";
import { BannerForm } from "./BannerForm";
import { CustomSettings } from "./CustomSettings";

export const Extension = () => {
    return (
        <AdminConfig>
            <PageListConfig>
                {/*<PageListConfig.PageType name={"static"} remove={true} />*/}

                <PageListConfig.PageType
                    name={"banner"}
                    label={"Banner"}
                    element={<BannerForm />}
                />
            </PageListConfig>
            <CustomSettings />
        </AdminConfig>
    );
};
