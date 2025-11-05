import { createContextPlugin } from "@webiny/api";
import type { Context } from "../types";

export const createUniversalKeyAuthentication = () => {
    return createContextPlugin<Context>(context => {
        context.security.addAuthenticator(async token => {
            if (typeof token !== "string") {
                return null;
            }

            if (token !== String(process.env["WEBINY_API_UNIVERSAL_API_KEY"])) {
                return null;
            }

            return {
                id: "universal-api-key",
                displayName: "Nextjs API Key",
                type: "api-key",
                // Add permissions directly to the identity so we don't have to load them
                // again when authorization kicks in.
                permissions: [
                    {
                        name: "content.i18n"
                    },
                    {
                        name: "cms.endpoint.read"
                    },
                    {
                        name: "cms.endpoint.manage"
                    },
                    {
                        name: "cms.endpoint.preview"
                    },
                    {
                        name: "cms.contentModel",
                        own: false,
                        rwd: "r",
                        pw: ""
                    },
                    {
                        name: "cms.contentModelGroup",
                        own: false,
                        rwd: "r",
                        pw: ""
                    },
                    {
                        name: "cms.contentEntry",
                        own: false,
                        rwd: "rw",
                        pw: ""
                    }
                ]
            };
        });
    });
};
