// Tarot Types

export interface TarotCardInfo {
    card: string;    // "1" to "55"
    comment: string;  // Tarot comment for that card
}

export interface TarotReadingRequest {
    spreadType?: string; // e.g., "THREE_CARD"
}

export interface TarotReadingResponse {
    past: TarotCardInfo;
    present: TarotCardInfo;
    future: TarotCardInfo;
    fortuneId: number;
    remainingJetons: number | null;
}

// New types for reader-based flow
export enum FalCategory {
    ASK = 'ASK',
    KARIYER = 'KARIYER',
    PARA = 'PARA',
    SAGLIK = 'SAGLIK',
    AILE = 'AILE',
    GENEL = 'GENEL',
}

export enum TarotReadingStatus {
    WAITING = 'WAITING',
    READY = 'READY',
    EXPIRED = 'EXPIRED',
    FAILED = 'FAILED',
}

export interface TarotReaderResponse {
    id: number;
    name: string;
    avatar?: string; // Avatar image URL
    ratingCount: number;
    ratingScore: number;
    categories: FalCategory[];
    isActive: boolean;
    createdAt: string;
    imageUrl?: string; // Optional image URL (legacy)
    image?: string; // Alternative image property name (legacy)
    Image?: string; // Backend might use capitalized Image (legacy)
    [key: string]: any; // Allow any additional properties from backend
}

export interface TarotReadingCreateRequest {
    readerId: number;
    category: FalCategory;
}

export interface TarotReadingResponseNew {
    id: number;
    userId: number;
    readerId: number;
    readerName?: string; // Reader name
    category: FalCategory;
    card1: number;
    card2: number;
    card3: number;
    card1Name: string;
    card2Name: string;
    card3Name: string;
    resultText: string | null; // Only filled if READY
    status: TarotReadingStatus;
    createdAt: string;
    readyAt: string | null;
}

export interface TarotReadingListResponse {
    readings: TarotReadingResponseNew[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Turkish labels
export const STATUS_LABELS: Record<TarotReadingStatus, string> = {
    [TarotReadingStatus.WAITING]: 'Hazırlanıyor',
    [TarotReadingStatus.READY]: 'Hazır',
    [TarotReadingStatus.EXPIRED]: 'Süresi Doldu',
    [TarotReadingStatus.FAILED]: 'Başarısız',
};

export const CATEGORY_LABELS: Record<FalCategory, string> = {
    [FalCategory.ASK]: 'Aşk',
    [FalCategory.KARIYER]: 'Kariyer',
    [FalCategory.PARA]: 'Para',
    [FalCategory.SAGLIK]: 'Sağlık',
    [FalCategory.AILE]: 'Aile',
    [FalCategory.GENEL]: 'Genel',
};

export const CATEGORY_ICONS: Record<FalCategory, string> = {
    [FalCategory.ASK]: '❤️',
    [FalCategory.KARIYER]: '💼',
    [FalCategory.PARA]: '💰',
    [FalCategory.SAGLIK]: '💚',
    [FalCategory.AILE]: '👨‍👩‍👧‍👦',
    [FalCategory.GENEL]: '✨',
};
