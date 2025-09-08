import { useContext } from "react";
import { RouterPresenterContext } from "~/Router/Router";

export function useRouter() {
    const routerPresenter = useContext(RouterPresenterContext);
    if (!routerPresenter) {
        throw Error(`Router is not configured!`);
    }

    return routerPresenter;
}
