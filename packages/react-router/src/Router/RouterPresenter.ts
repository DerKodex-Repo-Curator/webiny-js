import { makeAutoObservable, toJS } from "mobx";
import {
    IRouterRepository,
    RouteDefinition,
    RouteParams
} from "~/Router/abstractions/IRouterRepository";
import { MatchedRoute, OnRouteExit } from "~/Router/abstractions/IRouterGateway";

interface RouterViewModel {
    currentRoute: MatchedRoute | undefined;
}

export interface IRouterPresenter {
    vm: RouterViewModel;
    bootstrap(routes: RouteDefinition[]): void;
    goToRoute(name: string, params?: RouteParams): void;
    onRouteExit(cb: OnRouteExit): void;
    destroy(): void;
}

export class RouterPresenter implements IRouterPresenter {
    private routerRepository: IRouterRepository;

    constructor(routerRepository: IRouterRepository) {
        this.routerRepository = routerRepository;

        makeAutoObservable(this);
    }

    get vm() {
        return {
            currentRoute: toJS(this.routerRepository.getCurrentRoute())
        };
    }

    bootstrap = (routes: RouteDefinition[]) => {
        this.routerRepository.registerRoutes(
            routes.map(route => ({ name: route.name, path: route.path }))
        );
    };

    goToRoute = (name: string, params?: RouteParams) => {
        this.routerRepository.goToRoute(name, params);
    };

    onRouteExit = (cb: OnRouteExit) => {
        this.routerRepository.onRouteExit(cb);
    };

    destroy() {
        this.routerRepository.destroy();
    }
}
