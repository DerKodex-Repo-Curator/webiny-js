import React, { FunctionComponentElement, useEffect } from "react";
import { plugins } from "@webiny/plugins";
import { RouteProps, useRouter, RouteContent, RouteDefinition } from "@webiny/react-router";
import type { RoutePlugin } from "~/types";

type RouteDefinitions = RouteDefinition[];

const normalizeRoutes = (routes: FunctionComponentElement<RouteProps>[]): RouteDefinitions => {
    return routes.filter(Boolean).map(route => {
        return {
            name: route.props.name ?? route.props.path,
            path: route.props.path,
            element: route.props.element || route.props.children || route.props.render
        };
    }) as RouteDefinitions;
};

interface RoutesProps {
    routes: JSX.Element[];
}

export const Routes = (props: RoutesProps) => {
    const { setRoutes } = useRouter();

    useEffect(() => {
        const routes = [
            ...props.routes,
            // For backwards compatibility, we need to support the RoutePlugin routes as well.
            ...plugins.byType<RoutePlugin>("route").map(({ route }) => route)
        ].sort((a, b) => {
            const pathA = a.props.path || "*";
            const pathB = b.props.path || "*";

            // This will sort paths at the very bottom of the list
            if (pathA === "/" && pathB === "*") {
                return -1;
            }

            // This will push * and / to the bottom of the list
            if (pathA === "*" || pathA === "/") {
                return 1;
            }

            // This will push * and / to the bottom of the list
            if (["*", "/"].includes(pathB)) {
                return -1;
            }

            return 0;
        });

        setRoutes(normalizeRoutes(routes));
    }, [props.routes.length]);

    return <RouteContent />;
};
