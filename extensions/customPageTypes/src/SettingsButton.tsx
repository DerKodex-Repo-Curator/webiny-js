import React from "react";
import { toJS } from "mobx";
import { IconButton, Grid } from "@webiny/admin-ui";
import { ReactComponent as SettingsIcon } from "@webiny/icons/info.svg";
import { useDialogs } from "@webiny/app-admin";
import { useDocumentEditor } from "@webiny/app-website-builder/DocumentEditor";
import { BannerForm } from "./BannerForm";

export const SettingsButton = () => {
    const dialogs = useDialogs();
    const editor = useDocumentEditor();

    const showDialog = () => {
        dialogs.showDialog({
            title: "Custom Settings",
            description: "Configure your banner.",
            dismissible: false,
            acceptLabel: "Save Settings",
            formData: async () => {
                const formData = {
                    properties: editor.getDocumentState().read().properties,
                    metadata: editor.getDocumentState().read().metadata
                };
                return structuredClone(toJS(formData));
            },
            content: <Grid><BannerForm /></Grid>,
            onAccept: data => {
                editor.updateDocument(document => {
                    document.properties = data["properties"];
                    document.metadata = data["metadata"];
                });
            }
        });
    };

    return (
        <div className={"wby-flex wby-gap-x-sm"}>
            <IconButton
                variant="secondary"
                icon={<SettingsIcon />}
                onClick={showDialog}
            ></IconButton>
        </div>
    );
};
