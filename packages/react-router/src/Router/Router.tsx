import React, { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import type { History, Location } from "history";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { HistoryRouterGateway } from "./HistoryRouterGateway";
import { RouterRepository } from "./RouterRepository";
import { IRouterPresenter, RouterPresenter } from "./RouterPresenter";
import { MatchedRoute } from "./abstractions/IRouterGateway";

/**
 * @deprecated Use proper JSX.Element instead!
 */
interface DeprecatedRenderFunction {
    (params: { location: Location }): JSX.Element;
}

export interface RouteDefinition {
    name: string;
    path: string;
    element: JSX.Element | DeprecatedRenderFunction;
}

interface RouterProps {
    getBaseUrl: () => string;
    history: History;
    children: JSX.Element;
}

interface MatchedRouteWithElement extends MatchedRoute {
    element: JSX.Element;
}

export interface RouterPresenterContext {
    route: MatchedRoute;
    goToRoute: IRouterPresenter["goToRoute"];
    onRouteExit: IRouterPresenter["onRouteExit"];
    setRoutes: (routes: RouteDefinition[]) => void;
}

const RouteContext = React.createContext<MatchedRouteWithElement | undefined>(undefined);
export const RouterPresenterContext = React.createContext<RouterPresenterContext | undefined>(
    undefined
);

export const Router = observer(({ getBaseUrl, history, children }: RouterProps) => {
    const baseUrl = getBaseUrl();

    const presenter = useMemo(() => {
        const gateway = new HistoryRouterGateway(history, baseUrl);
        const repository = new RouterRepository(gateway);
        return new RouterPresenter(repository);
    }, []);

    useEffect(() => {
        return () => {
            presenter.destroy();
        };
    }, []);

    const getElementFromRoute = useCallback(
        (route: RouteDefinition) => {
            // For backwards compatibility.
            if (typeof route.element === "function") {
                console.warn(
                    `Deprecated "element" property usage in route ${route.name} (${route.path}).`
                );
                return route.element({ location: history.location });
            }
            return route.element;
        },
        [history]
    );

    const routesRef = useRef<RouteDefinition[]>([]);
    const { currentRoute } = presenter.vm;

    const route = currentRoute
        ? routesRef.current.find(route => route.name === currentRoute.name)
        : null;

    const routeContext: MatchedRouteWithElement | undefined = useMemo(() => {
        return route && currentRoute
            ? { ...currentRoute, element: getElementFromRoute(route) }
            : undefined;
    }, [route, currentRoute]);

    const presenterContext: RouterPresenterContext = {
        route: toJS(currentRoute)!,
        goToRoute: presenter.goToRoute,
        onRouteExit: presenter.onRouteExit,
        setRoutes: (routes: RouteDefinition[]) => {
            routesRef.current = routes;

            presenter.bootstrap(
                routes.map(route => ({
                    name: route.name,
                    path: route.path
                }))
            );
        }
    };

    return (
        <RouterPresenterContext.Provider value={presenterContext}>
            <RouteContext.Provider value={routeContext}>{children}</RouteContext.Provider>
        </RouterPresenterContext.Provider>
    );
});

export const RouteContent = observer(() => {
    const route = useContext(RouteContext);

    if (!route) {
        return null;
    }

    return <>{route.element}</>;
});
