import React from "react";
import { useTenancy } from "@webiny/app-tenancy";
import { CustomIdp } from "./CustomIdp";

const useGoToLoginHook = () => {
    const { tenant } = useTenancy();

    return () => {
        window.location.href = `http://localhost:3000/login?tenantId=${tenant}`;
    };
};

const useGetFreshTokensHook = () => {
    return (refreshToken: string) => {
        return fetch(`http://localhost:3000/refresh?token=${refreshToken}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(json => {
                return {
                    idToken: json.idToken,
                    refreshToken: json.refreshToken
                };
            });
    };
};

export const Extension = () => {
    return (
        <CustomIdp
            goToLogin={useGoToLoginHook}
            getFreshTokens={useGetFreshTokensHook}
            refreshInterval={60}
        />
    );
};
