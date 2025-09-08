import { makeAutoObservable, runInAction, toJS } from "mobx";
import {
    MatchedRoute,
    RouteDefinition as GatewayRouteDefinition,
    RouteParams,
    IRouterGateway,
    OnRouteExit
} from "~/Router/abstractions/IRouterGateway";
import { IRouterRepository } from "~/Router/abstractions/IRouterRepository";

const INIT_ROUTE = { name: "__init__", path: "", pathname: "", params: {}, queryParams: {} };

export type RouteDefinition = Pick<GatewayRouteDefinition, "name" | "path">;

export class RouterRepository implements IRouterRepository {
    private gateway: IRouterGateway;
    private currentRoute: MatchedRoute = INIT_ROUTE;
    private routes: RouteDefinition[] = [];

    constructor(gateway: IRouterGateway) {
        this.gateway = gateway;

        makeAutoObservable(this);
    }

    getCurrentRoute() {
        return this.currentRoute.name !== INIT_ROUTE.name ? this.currentRoute : undefined;
    }

    registerRoutes = (routes: RouteDefinition[]) => {
        this.routes = routes;
        const routesWithAction = routes.map<GatewayRouteDefinition>(route => {
            return {
                ...route,
                onMatch: this.transitionToRoute.bind(this)
            };
        });

        this.gateway.registerRoutes(routesWithAction);
    };

    getRouteByName(name: string): RouteDefinition | undefined {
        return this.routes.find(route => route.name === name);
    }

    goToRoute(name: string, params?: RouteParams): void {
        this.gateway.goToRoute(name, params ?? {});
    }

    onRouteExit(cb: OnRouteExit): void {
        this.gateway.onRouteExit(cb);
    }

    destroy() {
        this.gateway.destroy();
    }

    private async transitionToRoute(route: MatchedRoute) {
        runInAction(() => {
            Object.assign(this.currentRoute, route);
        });
    }
}
