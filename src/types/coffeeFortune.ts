// Coffee Fortune Types

import { FalCategory } from './fortuneWheel';

export enum CoffeeFortuneStatus {
    WAITING = 'WAITING',
    READY = 'READY',
    EXPIRED = 'EXPIRED',
    FAILED = 'FAILED',
}

export interface CoffeeFortuneResponse {
    id: number;
    userId: number;
    status: CoffeeFortuneStatus;
    category: FalCategory;
    comment: string | null; // null if status is WAITING
    imagePath: string;
    createdAt: string;
    readyAt: string | null;
    updatedAt: string;
}

export interface CoffeeFortuneListResponse {
    fortunes: CoffeeFortuneResponse[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface CoffeeFortuneCreateRequest {
    category: FalCategory;
}

// Turkish labels for status
export const STATUS_LABELS: Record<CoffeeFortuneStatus, string> = {
    [CoffeeFortuneStatus.WAITING]: 'Hazırlanıyor',
    [CoffeeFortuneStatus.READY]: 'Hazır',
    [CoffeeFortuneStatus.EXPIRED]: 'Süresi Doldu',
    [CoffeeFortuneStatus.FAILED]: 'Başarısız',
};

