// Cookie Fortune Types

export interface CookieFortuneResponse {
    fortuneId: number;
    message: string;
    nextCookieAvailable: string; // ISO date string
}

