import React, { useEffect, useRef } from "react";
import { useRouter } from "@webiny/react-router";
import { useDialogs } from "~/components/Dialogs/useDialogs";

interface NavigationPromptProps {
    when: boolean;
    message: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
}

export const NavigationPrompt = ({
    when,
    message,
    confirmLabel,
    cancelLabel
}: NavigationPromptProps) => {
    const stateRef = useRef(when);
    const router = useRouter();
    const dialogs = useDialogs();

    useEffect(() => {
        router.onRouteExit(transition => {
            if (stateRef.current) {
                dialogs.showDialog({
                    title: "Confirm Navigation",
                    content: message,
                    acceptLabel: confirmLabel ?? "Yes!",
                    cancelLabel: cancelLabel ?? "No, stay here.",
                    onAccept: () => {
                        transition.continue();
                    }
                });
            } else {
                transition.continue();
            }
        });
    }, []);

    useEffect(() => {
        stateRef.current = when;
    }, [when]);

    return null;
};
