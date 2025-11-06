import React, { useMemo, useRef } from "react";
import { ElementOverlays } from "./Overlays/ElementOverlays";
import { ConnectEditorToPreview } from "~/DocumentEditor/ConnectEditorToPreview";
import type { Messenger } from "@webiny/website-builder-sdk";
import { useResponsiveContainer } from "~/BaseEditor/defaultConfig/Content/Preview/useResponsiveContainer";
import { OverlayLoader } from "@webiny/admin-ui";
import type { ViewportManager } from "@webiny/website-builder-sdk";
import { observer } from "mobx-react-lite";
import { usePreviewData } from "~/BaseEditor/hooks/usePreviewData";

interface IframeProps {
    url: string;
    timestamp: number;
    showLoading: boolean;
    viewportManager: ViewportManager;
    onConnected: (messenger: Messenger) => void;
}

export const Iframe = observer(({ url, timestamp, ...props }: IframeProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const previewSize = useResponsiveContainer(props.viewportManager);
    const { viewport } = usePreviewData();

    const iframeUrl = useMemo(() => {
        const localUrl = new URL(url);
        localUrl.searchParams.set("wb.ts", timestamp.toString());
        return localUrl.toString();
    }, [url, timestamp]);

    return (
        <div
            id={"preview-container"}
            key={iframeUrl}
            /* Height = viewport height - top bar - address bar - breadcrumbs. */
            style={{
                height: "calc(100vh - 43px - 50px - 31px)"
            }}
            className={
                "wby-relative wby-flex wby-flex-col wby-items-center wby-w-full wby-overflow-auto"
            }
        >
            <ConnectEditorToPreview iframeRef={iframeRef} onConnected={props.onConnected} />
            {props.showLoading ? (
                <OverlayLoader
                    size="lg"
                    variant="accent"
                    text="Loading preview..."
                    className={"wby-bg-neutral-base"}
                />
            ) : null}
            {/* Content wrapper - sized by iframe content */}
            <div
                id={"preview-body"}
                style={{
                    position: "relative",
                    width: previewSize,
                    minHeight: `${viewport.scrollHeight}px`
                }}
            >
                <ElementOverlays />
                <iframe
                    scrolling="no"
                    id={"preview-iframe"}
                    className={
                        "wby-absolute wby-block wby-top-0 wby-left-0 wby-w-full w-h-full wby-bg-white wby-border-none wby-min-h-[inherit] wby-pointer-events-none"
                    }
                    src={iframeUrl}
                    ref={iframeRef}
                    sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals allow-forms"
                />
            </div>
        </div>
    );
});

Iframe.displayName = "Iframe";
