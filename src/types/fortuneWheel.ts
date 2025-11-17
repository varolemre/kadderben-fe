// Fortune Wheel Types

export enum FalCategory {
    ASK = 'ASK',
    KARIYER = 'KARIYER',
    PARA = 'PARA',
    SAGLIK = 'SAGLIK',
    AILE = 'AILE',
    GENEL = 'GENEL',
}

export interface WheelStatusResponse {
    canSpinForFree: boolean;
    lastSpinTime?: string;
    nextFreeSpinAvailable?: string;
    currentJetons: number;
    canSpinWithJetons: boolean;
}

export interface SpinWheelRequest {
    category: FalCategory;
    useFreeSpinIfAvailable?: boolean;
}

export interface SpinWheelResponse {
    fortuneId: number;
    category: FalCategory;
    comment: string;
    wasFreeSpinUsed: boolean;
    jetonSpent: number;
    remainingJetons: number;
    nextFreeSpinAvailable?: string;
}

// Turkish labels for categories
export const CATEGORY_LABELS: Record<FalCategory, string> = {
    [FalCategory.ASK]: 'Aşk',
    [FalCategory.KARIYER]: 'Kariyer',
    [FalCategory.PARA]: 'Para',
    [FalCategory.SAGLIK]: 'Sağlık',
    [FalCategory.AILE]: 'Aile',
    [FalCategory.GENEL]: 'Genel',
};

