export interface ZodiacResponse {
    id: number;
    zodiacSign: string; // Enum name (KOC, BOGA, etc.)
    name: string; // Display name (Koç, Boğa, etc.)
    description: string; // HTML formatında açıklama
    specialQuote: string; // Özel söz
}

