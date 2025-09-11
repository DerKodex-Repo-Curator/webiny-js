import { makeAutoObservable } from "mobx";
const ID_TOKEN_KEY = "auth.idToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";

type Tokens = {
    idToken: string | undefined;
    refreshToken: string | undefined;
};

export class TokenManager {
    private tokens: Tokens = { refreshToken: undefined, idToken: undefined };

    constructor() {
        this.tokens = {
            idToken: undefined,
            refreshToken: undefined
        };

        makeAutoObservable(this);
        this.init();
    }

    get idToken() {
        return this.tokens.idToken;
    }

    get refreshToken() {
        return this.tokens.refreshToken;
    }

    // Save both tokens to localStorage.
    public setTokens(tokens: { idToken: string; refreshToken: string }): void {
        this.tokens = {
            idToken: tokens.idToken,
            refreshToken: tokens.refreshToken
        };

        localStorage.setItem(ID_TOKEN_KEY, tokens.idToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }

    // Clear both tokens from localStorage.
    public clearTokens(): void {
        this.tokens = {
            idToken: undefined,
            refreshToken: undefined
        };

        localStorage.removeItem(ID_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    // Read both tokens from localStorage.
    private init() {
        this.tokens = {
            idToken: localStorage.getItem(ID_TOKEN_KEY) ?? undefined,
            refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined
        };
    }
}
