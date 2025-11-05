import React from "react";
import { CheckboxGroup, Grid, Input } from "@webiny/admin-ui";
import { pagePathFromTitle } from "@webiny/app-website-builder";
import type { FormAPI } from "@webiny/form";
import { Bind, UnsetOnUnmount, useForm } from "@webiny/form";
import { validation } from "@webiny/validation";
import { IsRootTenant } from "@webiny/app-serverless-cms";
import { generateAlphaNumericLowerCaseId } from "@webiny/utils";

const generatePath = (form: FormAPI) => () => {
    const title = form.getValue("properties.title");

    const titlePath = pagePathFromTitle(title ?? "");

    const slug = form.getValue("properties.slug");
    const path = form.getValue("properties.path");

    if (!slug) {
        form.setValue("properties.slug", titlePath);
    }

    if (!path) {
        form.setValue("properties.path", `/${generateAlphaNumericLowerCaseId()}`);
    }
};

export const BannerForm = () => {
    const form = useForm();

    return (
        <>
            <Grid.Column span={12}>
                <UnsetOnUnmount name={"properties.title"}>
                    <Bind name={"properties.title"} validators={[validation.create("required")]}>
                        <Input label={"Title"} onBlur={generatePath(form)} />
                    </Bind>
                </UnsetOnUnmount>
            </Grid.Column>
            <Grid.Column span={12}>
                <UnsetOnUnmount name={"properties.slug"}>
                    <Bind name={"properties.slug"} validators={[validation.create("required")]}>
                        <Input
                            label={"Slug"}
                            description={"Use this slug to fetch the document via API"}
                        />
                    </Bind>
                </UnsetOnUnmount>
            </Grid.Column>
            <Grid.Column span={6}>
                <UnsetOnUnmount name={"properties.dateStart"}>
                    <Bind name={"properties.dateStart"}>
                        <Input
                            type={"date"}
                            label={"Date Start"}
                            description={"Activate on this date"}
                        />
                    </Bind>
                </UnsetOnUnmount>
            </Grid.Column>
            <Grid.Column span={6}>
                <UnsetOnUnmount name={"properties.dateEnd"}>
                    <Bind name={"properties.dateEnd"}>
                        <Input
                            type={"date"}
                            label={"Date End"}
                            description={"Deactivate after this date"}
                        />
                    </Bind>
                </UnsetOnUnmount>
            </Grid.Column>
            <IsRootTenant>
                <Grid.Column span={12}>
                    <UnsetOnUnmount name={"properties.merchantType"}>
                        <Bind
                            name={"properties.merchantTypes"}
                            validators={[validation.create("required")]}
                        >
                            <CheckboxGroup
                                description={"Select applicable merchant types"}
                                label={"Merchant Types"}
                                items={[
                                    { label: "Red", value: "red" },
                                    { label: "Green", value: "green" },
                                    { label: "Blue", value: "blue" }
                                ]}
                            />
                        </Bind>
                    </UnsetOnUnmount>
                </Grid.Column>
            </IsRootTenant>
            <Grid.Column span={12}>
                <UnsetOnUnmount name={"properties.path"}>
                    <Bind name={"properties.path"} validators={[validation.create("required")]}>
                        <Input label={"Path"} disabled={true} />
                    </Bind>
                </UnsetOnUnmount>
            </Grid.Column>
        </>
    );
};
