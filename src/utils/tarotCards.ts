// Tarot Card Image Mapping
// Metro bundler requires static requires, so we map all 55 cards explicitly
// Files are named as: {number}-{name}.png (e.g., 1-adalet.png, 2-asilan-adam.png)
// Note: File names use NFD encoding for Turkish characters

export const TAROT_CARD_IMAGES: Record<string, any> = {
    "1": require('../assets/img/tarot/1-adalet.png'),
    "2": require('../assets/img/tarot/2-asilan-adam.png'),
    "3": require('../assets/img/tarot/3-aşıklar.png'),
    "4": require('../assets/img/tarot/4-ay.png'),
    "5": require('../assets/img/tarot/5-aziz.png'),
    "6": require('../assets/img/tarot/6-azize.png'),
    "7": require('../assets/img/tarot/7-büyücü.png'),
    "8": require('../assets/img/tarot/8-değnek altılısı.png'),
    "9": require('../assets/img/tarot/9-değnek dokuzlusu.png'),
    "10": require('../assets/img/tarot/10-değnek kralı.png'),
    "11": require('../assets/img/tarot/11-değnek kraliçesi.png'),
    "12": require('../assets/img/tarot/12-değnek onlusu.png'),
    "13": require('../assets/img/tarot/13-değnek prensi.png'),
    "14": require('../assets/img/tarot/14-değnek sekizlisi.png'),
    "15": require('../assets/img/tarot/15-değnek şövalyesi.png'),
    "16": require('../assets/img/tarot/16-değnek yedilisi.png'),
    "17": require('../assets/img/tarot/17-denge.png'),
    "18": require('../assets/img/tarot/18-dünya.png'),
    "19": require('../assets/img/tarot/19-ermiş.png'),
    "20": require('../assets/img/tarot/20-güç.png'),
    "21": require('../assets/img/tarot/21-güneş.png'),
    "22": require('../assets/img/tarot/22-imparator.png'),
    "23": require('../assets/img/tarot/23-imporatiçe.png'),
    "24": require('../assets/img/tarot/24-joker.png'),
    "25": require('../assets/img/tarot/25-kader çarkı.png'),
    "26": require('../assets/img/tarot/26-kılıç ası.png'),
    "27": require('../assets/img/tarot/27-kılıç beşlisi.png'),
    "28": require('../assets/img/tarot/28-kılıç ikilisi.png'),
    "29": require('../assets/img/tarot/29-kılıç kralı.png'),
    "30": require('../assets/img/tarot/30-kılıç prensi.png'),
    "31": require('../assets/img/tarot/31-kılıç şövalyesi.png'),
    "32": require('../assets/img/tarot/32-kılıç üçlüsü.png'),
    "33": require('../assets/img/tarot/33-kule.png'),
    "34": require('../assets/img/tarot/34-kupa ası.png'),
    "35": require('../assets/img/tarot/35-kupa beşlisi.png'),
    "36": require('../assets/img/tarot/36-kupa dörtlüsü.png'),
    "37": require('../assets/img/tarot/37-kupa ikilisi.png'),
    "38": require('../assets/img/tarot/38-kupa kralı.png'),
    "39": require('../assets/img/tarot/39-kupa kraliçesi.png'),
    "40": require('../assets/img/tarot/40-kupa prensi.png'),
    "41": require('../assets/img/tarot/41-kupa şövalyesi.png'),
    "42": require('../assets/img/tarot/42-kupa üçlüsü.png'),
    "43": require('../assets/img/tarot/43-mahkeme.png'),
    "44": require('../assets/img/tarot/44-ölüm.png'),
    "45": require('../assets/img/tarot/45-savaş arabası.png'),
    "46": require('../assets/img/tarot/46-şeytan.png'),
    "47": require('../assets/img/tarot/47-tılsım altılısı.png'),
    "48": require('../assets/img/tarot/48-tılsım beşlisi.png'),
    "49": require('../assets/img/tarot/49-tılsım dokuzlusu.png'),
    "50": require('../assets/img/tarot/50-tılsım kralı.png'),
    "51": require('../assets/img/tarot/51-tılsım kraliçesi.png'),
    "52": require('../assets/img/tarot/52-tılsım yedilisi.png'),
    "53": require('../assets/img/tarot/53-yıldız.png'),
    // Note: Cards 54 and 55 may not exist yet, fallback to TAROT_CARD_BACK will be used
};

export const TAROT_CARD_BACK = require('../assets/img/tarot/tarotkapali.png');

/**
 * Get the image for a tarot card by its number (string "1" to "55")
 * Backend returns Integer (card1, card2, card3), we convert to string for lookup
 */
export const getTarotCardImage = (cardNumber: string | number): any => {
    const cardKey = String(cardNumber);
    return TAROT_CARD_IMAGES[cardKey] || TAROT_CARD_BACK;
};
