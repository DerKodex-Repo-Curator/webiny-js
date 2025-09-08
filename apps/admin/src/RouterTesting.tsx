import React, { useState } from "react";
import { useRouter } from "@webiny/react-router";
import { Button } from "@webiny/admin-ui";
import { NavigationPrompt } from "@webiny/app-admin/components";

export const DemoView = () => {
    const { goToRoute, route } = useRouter();
    const [blocked, setBlocked] = useState(false);

    return (
        <span>
            Demo View. Navigation is: {blocked ? "blocked" : "allowed"}
            <Button
                onClick={() => {
                    setBlocked(v => !v);
                }}
                text={"Toggle"}
            />
            <Button onClick={() => goToRoute("my-editor", { id: 1, status: "locked" })} text={"Go to ID: 1"} />
            <Button onClick={() => goToRoute("my-editor", { id: 2 })} text={"Go to ID: 2"} />
            <pre>{JSON.stringify(route, null, 2)}</pre>
            <NavigationPrompt
                when={blocked}
                message={
                    "There are some unsaved changes! Are you sure you want to navigate away and discard the changes?"
                }
            />
        </span>
    );
};

export const DemoEditor = () => {
    const { goToRoute, route } = useRouter();

    return (
        <div>
            Demo Editor ID: {route.params.id}
            <br/>
            <pre>{JSON.stringify(route, null, 2)}</pre>
            <Button onClick={() => goToRoute("my-dashboard")} text={"Go to Dashboard"} />
        </div>
    );
};
