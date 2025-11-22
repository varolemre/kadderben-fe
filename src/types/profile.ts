// Profile Types

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum OccupationType {
    STUDENT = 'STUDENT',
    EMPLOYEE = 'EMPLOYEE',
    FREELANCER = 'FREELANCER',
    ENTREPRENEUR = 'ENTREPRENEUR',
    RETIRED = 'RETIRED',
    UNEMPLOYED = 'UNEMPLOYED',
    OTHER = 'OTHER',
}

export enum RelationshipStatus {
    SINGLE = 'SINGLE',
    IN_RELATIONSHIP = 'IN_RELATIONSHIP',
    MARRIED = 'MARRIED',
    DIVORCED = 'DIVORCED',
    WIDOWED = 'WIDOWED',
    OTHER = 'OTHER',
}

export interface ProfileUpdateRequest {
    fullName?: string;
    gender?: Gender;
    birthDate?: string; // YYYY-MM-DD format
    birthTime?: string; // HH:mm format
    birthCountry?: string;
    birthCity?: string;
    occupation?: OccupationType;
    relationshipStatus?: RelationshipStatus;
    notificationsEnabled?: boolean;
    dailyHoroscopeEnabled?: boolean;
    preferredLanguage?: string;
}

export interface ProfileResponse {
    id: number;
    email: string;
    username?: string;
    fullName?: string;
    profileImageUrl?: string;
    gender?: Gender;
    birthDate?: string;
    birthTime?: string;
    birthCountry?: string;
    birthCity?: string;
    occupation?: OccupationType;
    relationshipStatus?: RelationshipStatus;
    notificationsEnabled?: boolean;
    dailyHoroscopeEnabled?: boolean;
    preferredLanguage?: string;
    jeton?: number;
    onboardingCompleted?: boolean;
}

