// Horoscope Types

export interface DailyHoroscopeResponse {
    id: number;
    zodiacSign: string; // Enum name (KOC, BOGA, etc.)
    zodiacSignDisplay: string; // Display name (Koç, Boğa, etc.)
    date: string; // ISO date string (YYYY-MM-DD)
    comment: string; // Günlük burç yorumu
}

// Zodiac sign emoji mapping
export const ZODIAC_ICONS: Record<string, string> = {
    'KOÇ': '♈',
    'BOĞA': '♉',
    'İKİZLER': '♊',
    'YENGEÇ': '♋',
    'ASLAN': '♌',
    'BAŞAK': '♍',
    'TERAZİ': '♎',
    'AKREP': '♏',
    'YAY': '♐',
    'OĞLAK': '♑',
    'KOVA': '♒',
    'BALIK': '♓',
};

