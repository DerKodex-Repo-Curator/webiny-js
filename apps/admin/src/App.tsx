import React from "react";
import { Admin, AdminConfig } from "@webiny/app-serverless-cms";
import { Cognito } from "@webiny/app-admin-users-cognito";
import { Extension as WebsiteBuilder } from "@webiny/app-website-builder/Extension";
import { Extensions } from "./Extensions";
import "./App.scss";
import { DemoView, DemoEditor } from "./RouterTesting";

export const App = () => {
    return (
        <Admin>
            <Cognito />
            <Extensions />
            <WebsiteBuilder />
            <AdminConfig>
                <AdminConfig.Route name={"my-dashboard"} path="/my-route" element={<DemoView />} />
                <AdminConfig.Route
                    name={"my-editor"}
                    path="/my-editor/:id"
                    element={<DemoEditor />}
                />
            </AdminConfig>
        </Admin>
    );
};
