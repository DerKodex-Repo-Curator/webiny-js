import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo } from "react";
import { LoginScreenRenderer } from "@webiny/app-admin";
import { useSecurity } from "@webiny/app-security";
import { OverlayLoader } from "@webiny/admin-ui";
import { Authenticator, type Tokens, type GetFreshTokens, type GoToLogin } from "./Authenticator";

interface CustomIdpProps {
    goToLogin: () => GoToLogin;
    getFreshTokens: () => GetFreshTokens;
    refreshInterval: number;
}

export const CustomIdp = (props: CustomIdpProps) => {
    const LoginScreenDecorator = useMemo(() => {
        return LoginScreenRenderer.createDecorator(() => {
            return function LoginScreenRenderer({ children }) {
                return <LoginScreen {...props}>{children}</LoginScreen>;
            };
        });
    }, []);

    return <LoginScreenDecorator />;
};

type Children = {
    children: React.ReactNode;
};

const LoginScreen = observer(({ children, ...props }: CustomIdpProps & Children) => {
    const { setIdTokenProvider } = useSecurity();
    const goToLogin = props.goToLogin();
    const getFreshTokens = props.getFreshTokens();

    const authenticator = useMemo(() => {
        return new Authenticator(goToLogin, getFreshTokens, props.refreshInterval);
    }, []);

    useEffect(() => {
        // Parse tokens from URL and initialize Authenticator.
        const tokens = getTokensFromUrl();
        authenticator.init(tokens);

        // Set idToken provider into the security module.
        setIdTokenProvider(() => authenticator.getIdToken());

        return () => {
            authenticator.destroy();
        }
    }, [authenticator]);

    const { isAuthenticated, isRefreshing } = authenticator.vm;

    return (
        <>
            {isAuthenticated ? children : null}
            {!isAuthenticated && isRefreshing ? (
                <OverlayLoader title={"Verifying identity..."} />
            ) : null}
            {!isAuthenticated && !isRefreshing ? <>Unauthenticated</> : null}
        </>
    );
});

export function getTokensFromUrl(): Tokens | undefined {
    const data = new URLSearchParams(window.location.search);
    const idToken = data.get("idToken") ?? undefined;
    const refreshToken = data.get("refreshToken") ?? undefined;

    if (!idToken || !refreshToken) {
        return undefined;
    }

    return { idToken, refreshToken };
}
