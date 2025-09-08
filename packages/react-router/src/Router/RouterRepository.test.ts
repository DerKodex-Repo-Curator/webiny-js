import { createMemoryHistory } from "history";
import { HistoryRouterGateway } from "~/Router/HistoryRouterGateway";
import { RouterRepository } from "~/Router/RouterRepository";

const wait = () => new Promise(resolve => setTimeout(resolve, 10));

const allRoutes = [
    { name: "home", path: "/" },
    { name: "login", path: "/login" },
    { name: "userById", path: "/users/:id" }
];

const loginRoute = {
    name: "login",
    path: "/login",
    pathname: "/login",
    params: {},
    queryParams: {}
};

const userRoute = {
    name: "userById",
    path: "/users/:id",
    pathname: "/users/123",
    params: {
        id: "123"
    },
    queryParams: {}
};

const createRepository = () => {
    const history = createMemoryHistory();
    history.replace("/__unknown__");

    const gateway = new HistoryRouterGateway(history, "");
    const repository = new RouterRepository(gateway);

    repository.registerRoutes(allRoutes);

    return { repository, history };
};

describe("Router Repository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("state should contain current route", async () => {
        const { repository, history } = createRepository();
        history.push("/login");
        await wait();

        expect(repository.getCurrentRoute()).toEqual(loginRoute);
    });

    it("route guard should allow or prevent route transition", async () => {
        const { repository, history } = createRepository();
        history.push("/login");
        await wait();

        // This guard should prevent the transition.
        // The Repository should stay where it was, and the `history` should restore the previous URL.
        repository.onRouteExit(() => false);

        // Trigger a history location change (imagine a click on "Back" button in the browser).
        history.push("/users/123");
        await wait();

        expect(repository.getCurrentRoute()).toEqual(loginRoute);

        // This guard should allow the transition.
        repository.onRouteExit(() => true);

        // Trigger a history location change (imagine a click on "Back" button in the browser).
        history.push("/users/123");
        await wait();

        expect(repository.getCurrentRoute()).toEqual(userRoute);
    });

    it("route guard should be unset after route transition", async () => {
        const guardSpy = jest.fn();
        const { repository, history } = createRepository();
        history.push("/login");
        await wait();

        // This guard should prevent the transition.
        // The Repository should stay where it was, and the `history` should restore the previous URL.
        repository.onRouteExit(() => {
            guardSpy();
            return true;
        });

        // Trigger a history location change (imagine a click on "Back" button in the browser).
        history.push("/users/123");
        await wait();

        expect(repository.getCurrentRoute()).toEqual(userRoute);
        expect(guardSpy).toHaveBeenCalledTimes(1);
        jest.resetAllMocks();

        // Trigger a history location change (imagine a click on "Back" button in the browser).
        history.push("/login");
        await wait();

        expect(repository.getCurrentRoute()).toEqual(loginRoute);
        expect(guardSpy).toHaveBeenCalledTimes(0);
    });
});
