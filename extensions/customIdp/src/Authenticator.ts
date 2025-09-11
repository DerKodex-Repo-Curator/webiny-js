import { makeAutoObservable, runInAction } from "mobx";
import { TokenManager } from "./TokenManager";

export type Tokens = { idToken: string; refreshToken: string };

export type GoToLogin = () => void;

export type GetFreshTokens = (refreshToken: string) => Promise<Tokens>;

export class Authenticator {
    private readonly goToLogin: GoToLogin;
    private readonly getFreshTokens: GetFreshTokens;
    private readonly refreshInterval: number;
    private tokenManager = new TokenManager();
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isAuthenticated = false;
    private refreshing = false;

    constructor(
        goToLogin: GoToLogin,
        getFreshTokens: GetFreshTokens,
        refreshIntervalInSeconds: number
    ) {
        this.goToLogin = goToLogin;
        this.getFreshTokens = getFreshTokens;
        this.refreshInterval = refreshIntervalInSeconds * 1000;
        makeAutoObservable(this);
    }

    get vm() {
        return {
            isAuthenticated: this.isAuthenticated,
            isRefreshing: this.refreshing
        };
    }

    getIdToken() {
        return this.tokenManager.idToken;
    }

    public init(tokens?: Tokens) {
        console.log("Authenticator.init", tokens);
        if (tokens) {
            this.tokenManager.setTokens(tokens);
        }

        this.initialize();
    }

    public destroy() {
        clearInterval(this.refreshInterval);
    }

    // Initialize authentication check and start refresh loop.
    private async initialize(): Promise<void> {
        const idToken = this.tokenManager.idToken;

        if (!idToken) {
            this.setUnauthenticated();
            console.log("Authenticator.initialize.goToLogin");
            this.goToLogin();
            return;
        }

        this.setAuthenticated();
        this.startTokenRefreshLoop();
    }

    // Refresh tokens on a regular interval.
    private startTokenRefreshLoop(): void {
        console.log("Authenticator.startTokenRefreshLoop");
        this.intervalId = setInterval(() => {
            this.refreshTokens();
        }, this.refreshInterval);
    }

    // Refresh the tokens and update state accordingly.
    private async refreshTokens(): Promise<void> {
        const refreshToken = this.tokenManager.refreshToken;

        if (!refreshToken) {
            console.log("Authenticator.refreshTokens.noRefreshToken");
            this.logout();
            return;
        }

        try {
            console.log("Authenticator.refreshTokens");
            this.setRefreshing(true);
            const freshTokens = await this.getFreshTokens(refreshToken);
            this.tokenManager.setTokens(freshTokens);
            this.setAuthenticated();
        } catch (err) {
            console.log("Authenticator.refreshTokens.error", err);
            runInAction(() => {
                this.logout();
            });
        } finally {
            this.setRefreshing(false);
        }
    }

    // Force logout the user and redirect.
    public logout(): void {
        console.log("Authenticator.logout");
        this.tokenManager.clearTokens();
        this.setUnauthenticated();

        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log("Authenticator.logout.goToLogin");
        this.goToLogin();
    }

    private setAuthenticated(): void {
        runInAction(() => {
            this.isAuthenticated = true;
        });
    }

    private setUnauthenticated(): void {
        runInAction(() => {
            this.isAuthenticated = false;
        });
    }

    private setRefreshing(flag: boolean): void {
        runInAction(() => {
            this.refreshing = flag;
        });
    }
}
