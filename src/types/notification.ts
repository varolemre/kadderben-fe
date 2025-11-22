// Notification Types

export enum NotificationType {
    SYSTEM = 'SYSTEM',
    FORTUNE_READY = 'FORTUNE_READY',
    HOROSCOPE = 'HOROSCOPE',
    PROMOTION = 'PROMOTION',
    OTHER = 'OTHER',
}

export interface NotificationResponse {
    id: number;
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    imageUrl?: string;
    actionUrl?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

export interface NotificationListResponse {
    notifications: NotificationResponse[];
    unreadCount: number;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

