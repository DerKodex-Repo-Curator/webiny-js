import { load } from "cheerio";
import { GetSettings } from "@webiny/api-admin-settings";
import { WEBSITE_BUILDER_SETTINGS } from "@webiny/api-website-builder/constants";
import { generateAlphaNumericLowerCaseId } from "@webiny/utils";
import { createContextPlugin, createGraphQLSchemaPlugin } from "@webiny/api-serverless-cms";
import type { WbPage } from "@webiny/api-website-builder/context/pages/pages.types.js";

interface DocumentHtmlArgs {
    slug: string;
    merchantId: string;
    today?: string;
}

export const createExtension = () => {
    return [
        createGraphQLSchemaPlugin({
            typeDefs: /* GraphQL*/ `
                extend type Query {
                    documentHtml(merchantId: ID!, slug: ID!, today: String): String
                }
            `,
            resolvers: {
                Query: {
                    documentHtml: async (_, args: DocumentHtmlArgs, context) => {
                        const {
                            slug,
                            merchantId,
                            today = new Date().toISOString().split("T")[0]
                        } = args;

                        const tenant = await context.tenancy.getTenantById(merchantId);

                        const [documents] = await context.tenancy.withTenant(tenant, () => {
                            return context.websiteBuilder.pages.list({
                                where: { properties: { slug }, published: true },
                                limit: 5,
                                sort: [`lastPublishedOn_DESC`],
                                after: null
                            });
                        });

                        const document = findApplicableDocument(today, documents);

                        if (!document) {
                            return "<!-- No document found! -->";
                        }

                        const getSettings = GetSettings.create(context);
                        const settings = await getSettings.execute(WEBSITE_BUILDER_SETTINGS);
                        const data = settings.getData();

                        const domain = data.previewDomain ?? "http://localhost:3000";

                        const html = await fetchHTML(
                            domain,
                            `${document.properties.path}?wb.tenant=${tenant.id}`
                        ).catch(err => {
                            console.log("Error fetching HTML", err.message);
                        });

                        return postProcessHtml(html ?? "");
                    }
                }
            }
        }),
        createContextPlugin(context => {
            context.websiteBuilder.pages.onPageBeforeDuplicate.subscribe(({ original }) => {
                original.properties["path"] = `/${generateAlphaNumericLowerCaseId()}`;
            });
        })
    ];
};

function findApplicableDocument(today: string, documents: WbPage[]): WbPage | undefined {
    if (documents.length === 0) {
        return undefined;
    }

    const matchingDocs = documents
        .map(doc => {
            const { dateStart, dateEnd } = doc.properties;

            const start = dateStart ?? "0000-01-01";
            const end = dateEnd ?? "9999-12-31";

            if (start <= today && today <= end) {
                // Compute duration as number of days using string difference
                const duration = computeDurationInDays(start, end);
                return { doc, duration };
            }

            return null;
        })
        .filter((item): item is { doc: WbPage; duration: number } => item !== null)
        .sort((a, b) => a.duration - b.duration); // shorter duration = higher priority

    if (matchingDocs.length > 0) {
        return matchingDocs[0].doc;
    }

    // Fallback: document with no dates
    return documents.find(doc => !doc.properties.dateStart && !doc.properties.dateEnd);
}

function computeDurationInDays(startStr: string, endStr: string): number {
    const start = new Date(startStr + "T00:00:00");
    const end = new Date(endStr + "T00:00:00");
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1; // inclusive
}

function fetchHTML(domain: string, path: string) {
    return fetch(`${domain}${path}`).then(res => res.text());
}

export const postProcessHtml = (html: string) => {
    const $ = load(html);

    // Replace <b> elements with their text content (unwrap them)
    $("script").each((_, el) => {
        $(el).remove();
    });

    return $("body").html() ?? html;
};
