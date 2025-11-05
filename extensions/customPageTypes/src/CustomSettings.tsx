import React from "react";
import { PageEditorConfig } from "@webiny/app-website-builder";
import { SettingsButton } from "./SettingsButton";

const { Ui } = PageEditorConfig;


export const CustomSettings = () => {
    return (
        <PageEditorConfig>
            <Ui.TopBar.Action name={"customSettings"} element={<SettingsButton />} />
            <Ui.TopBar.Action name={"buttonSettings"} remove />
        </PageEditorConfig>
    );
};
