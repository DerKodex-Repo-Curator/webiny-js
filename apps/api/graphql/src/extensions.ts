// This file is automatically updated via scaffolding utilities.
import { createExtension as DemoTenantManagementApiExtensionFactory } from "@demo/tenant-management-api";
import { createExtension as FetchDocumentHtmlExtensionFactory } from "fetch-document-html";

// Learn more about extensions: https://webiny.link/extensions
export const extensions = () => {
    return [DemoTenantManagementApiExtensionFactory(), FetchDocumentHtmlExtensionFactory()];
};
