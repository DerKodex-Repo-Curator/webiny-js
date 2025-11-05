// This file is automatically updated via scaffolding utilities.
// Learn more about extensions: https://webiny.link/extensions
import React from "react";
import { Extension as CustomPageTypesExtension } from "custom-page-types";
import { Extension as SampleEcommerceExtension } from "sample-ecommerce";
import { Extension as DemoTenantManagementAdminExtension } from "@demo/tenant-management-admin";

export const Extensions = () => {
    return (
        <>
            <DemoTenantManagementAdminExtension />
            <CustomPageTypesExtension />
            <SampleEcommerceExtension />
        </>
    );
};
