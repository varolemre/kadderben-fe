// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
    ScrollView,
    Dimensions,
    Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, ErrorPopup } from '../../components';
import { COLORS } from '../../utils/constants';
import * as tarotApi from '../../api/tarotApi';
import { TarotReaderResponse, TarotReadingResponseNew, FalCategory, TarotReadingStatus, CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS } from '../../types/tarot';
import { TAROT_CARD_BACK, getTarotCardImage } from '../../utils/tarotCards';
import useAuthStore from '../../store/authStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Initial stacked card - 70% of screen width for prominence
const STACKED_CARD_WIDTH = SCREEN_WIDTH * 0.7;
const STACKED_CARD_HEIGHT = STACKED_CARD_WIDTH * 1.4;
// Grid cards - 20 cards in 4x5 grid with overlapping
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 80) / 4; // 4 cards per row
const GRID_CARD_HEIGHT = GRID_CARD_WIDTH * 1.4;
const CARD_SPACING = 6; // Reduced spacing for overlapping effect
const GRID_CARD_COUNT = 20; // 4x5 grid
const FOCUSED_CARD_SIZE = SCREEN_WIDTH * 0.7;

type Phase = 'INITIAL' | 'SHUFFLING' | 'CHOOSING' | 'SHOWING_CARD' | 'REVEALING' | 'DONE' | 'WAITING';

interface FocusedCard {
    position: 'past' | 'present' | 'future';
    cardNumber: number;
    cardName: string;
    cardIndex: number;
}

const TarotReadingScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { user, refreshUser } = useAuthStore();
    
    const reader: TarotReaderResponse = route?.params?.reader;
    const [selectedCategory, setSelectedCategory] = useState<FalCategory>(FalCategory.GENEL);
    const [phase, setPhase] = useState<Phase>('INITIAL');
    const [readingData, setReadingData] = useState<TarotReadingResponseNew | null>(null);
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [revealStep, setRevealStep] = useState(0);
    const [focusedCard, setFocusedCard] = useState<FocusedCard | null>(null);
    const [revealingCardIndex, setRevealingCardIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showInfoPopup, setShowInfoPopup] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [showingCardIndex, setShowingCardIndex] = useState<number | null>(null); // Currently showing full-screen card
    
    // Animation refs for single card (INITIAL) and stacked deck (SHUFFLING)
    const stackedAnimations = useRef(
        Array.from({ length: 4 }, (_, index) => ({
            translateX: new Animated.Value(0),
            translateY: new Animated.Value(0),
            rotate: new Animated.Value(0),
            scale: new Animated.Value(1),
            opacity: new Animated.Value(index === 0 ? 1 : 0), // Only first card visible initially
        }))
    ).current;

    // Animation refs for grid cards
    const gridAnimations = useRef(
        Array.from({ length: GRID_CARD_COUNT }, () => ({
            scale: new Animated.Value(0),
            opacity: new Animated.Value(0),
            translateX: new Animated.Value(0),
            translateY: new Animated.Value(0),
        }))
    ).current;

    // Map grid positions to card numbers (randomly distributed)
    const [cardPositionMap, setCardPositionMap] = useState<Map<number, { cardNumber: number; cardName: string; position: 'past' | 'present' | 'future' }>>(new Map());
    // Store random offsets for card positions (to prevent re-rendering with different positions)
    const [cardOffsets, setCardOffsets] = useState<Map<number, { x: number; y: number }>>(new Map());

    // Grid entrance animation (for smooth appearance)
    const gridEntrance = useRef(new Animated.Value(0)).current;

    // Selected card highlight animations
    const selectedAnimations = useRef<Record<number, Animated.Value>>({}).current;

    // Overlay animations
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const overlayScale = useRef(new Animated.Value(0.8)).current;
    
    // Reveal card animation (for card moving to center in overlay)
    const revealCardScale = useRef(new Animated.Value(0.8)).current;
    const revealCardOpacity = useRef(new Animated.Value(0)).current;
    
    // Full-screen card animation
    const fullScreenCardScale = useRef(new Animated.Value(0.5)).current;
    const fullScreenCardOpacity = useRef(new Animated.Value(0)).current;

    // Timer for WAITING status
    useEffect(() => {
        if (readingData?.status === TarotReadingStatus.WAITING && readingData?.readyAt) {
            const updateTimer = () => {
                const now = new Date().getTime();
                const readyAt = new Date(readingData.readyAt).getTime();
                const remaining = Math.max(0, Math.floor((readyAt - now) / 1000));
                setTimeRemaining(remaining);
                
                if (remaining <= 0) {
                    // Check reading status again
                    checkReadingStatus();
                }
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [readingData]);

    const checkReadingStatus = async () => {
        if (!readingData?.id) return;
        
        try {
            const response = await tarotApi.getTarotReading(readingData.id);
            if (response.success && response.data) {
                setReadingData(response.data);
                if (response.data.status === TarotReadingStatus.READY) {
                    setPhase('DONE');
                }
            }
        } catch (err) {
            console.error('Error checking reading status:', err);
        }
    };

    // Shuffle animation for single card
    const animateShuffle = () => {
        const anim = stackedAnimations[0]; // Only animate the single card
        const randomX = (Math.random() - 0.5) * 15;
        const randomY = (Math.random() - 0.5) * 15;
        const randomRotate = (Math.random() - 0.5) * 0.15;
        
        return Animated.sequence([
            Animated.parallel([
                Animated.timing(anim.translateX, {
                    toValue: randomX,
                    duration: 150,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                    toValue: randomY,
                    duration: 150,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.rotate, {
                    toValue: randomRotate,
                    duration: 150,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(anim.translateX, {
                    toValue: -randomX,
                    duration: 150,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                    toValue: -randomY,
                    duration: 150,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.rotate, {
                    toValue: -randomRotate,
                    duration: 150,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(anim.translateX, {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.rotate, {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ]);
    };

    // Fan out animation - single card expands into 16 cards
    const animateFanOut = () => {
        // Calculate center position relative to grid container
        // Grid container is centered in contentArea
        const gridContainerWidth = GRID_CARD_WIDTH * 4 + CARD_SPACING * 3;
        const gridContainerHeight = GRID_CARD_HEIGHT * 4 + CARD_SPACING * 3;
        const centerX = gridContainerWidth / 2 - GRID_CARD_WIDTH / 2;
        const centerY = gridContainerHeight / 2 - GRID_CARD_HEIGHT / 2;

        // Fade out stacked deck
        const fadeOutStack = Animated.parallel(
            stackedAnimations.map(anim =>
                Animated.timing(anim.opacity, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                })
            )
        );

        // Calculate final positions for each grid card
        const rows = 4;
        const cols = 4;
        const cardAnimations = gridAnimations.map((anim, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const offset = cardOffsets.get(index) || { x: 0, y: 0 };
            const finalX = col * (GRID_CARD_WIDTH + CARD_SPACING) + offset.x;
            const finalY = row * (GRID_CARD_HEIGHT + CARD_SPACING) + offset.y;
            
            // Calculate starting position (center of grid container)
            const startX = centerX - finalX;
            const startY = centerY - finalY;
            
            // Initialize animation values
            anim.translateX.setValue(startX);
            anim.translateY.setValue(startY);
            anim.scale.setValue(0.3);
            anim.opacity.setValue(0);

            return Animated.parallel([
                Animated.timing(anim.translateX, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.out(Easing.back(1.1)),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.opacity, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]);
        });

        // Stagger the card animations for fan-out effect
        const fanOutCards = Animated.stagger(40, cardAnimations);

        return Animated.sequence([
            fadeOutStack,
            Animated.delay(100),
            fanOutCards,
        ]);
    };

    const startReading = async () => {
        if (!selectedCategory || !reader) {
            setErrorMessage('Lütfen bir kategori seçin');
            setShowErrorPopup(true);
            return;
        }

        setLoading(true);
        setErrorMessage(null);
        setShowErrorPopup(false);
        setPhase('SHUFFLING');

        try {
            // Start shuffle animation on single card
            const shuffleAnim = animateShuffle();
            shuffleAnim.start();

            // Call API to create reading
            const response = await tarotApi.createTarotReading({
                readerId: reader.id,
                category: selectedCategory,
            });
            
            if (response.success && response.data) {
                const reading: TarotReadingResponseNew = response.data;
                setReadingData(reading);
                
                // Randomly distribute the 3 cards among grid positions
                const positions: ('past' | 'present' | 'future')[] = ['past', 'present', 'future'];
                const cardNumbers = [reading.card1, reading.card2, reading.card3];
                const cardNames = [reading.card1Name, reading.card2Name, reading.card3Name];
                
                // Create array of all grid positions
                const allPositions = Array.from({ length: GRID_CARD_COUNT }, (_, i) => i);
                
                // Shuffle positions
                const shuffledPositions = allPositions.sort(() => Math.random() - 0.5);
                
                // Assign the 3 cards to random positions
                const newMap = new Map<number, { cardNumber: number; cardName: string; position: 'past' | 'present' | 'future' }>();
                const newOffsets = new Map<number, { x: number; y: number }>();
                
                cardNumbers.forEach((cardNum, idx) => {
                    const randomPos = shuffledPositions[idx];
                    newMap.set(randomPos, {
                        cardNumber: cardNum,
                        cardName: cardNames[idx],
                        position: positions[idx],
                    });
                });
                
                // Generate random offsets for all cards
                for (let i = 0; i < GRID_CARD_COUNT; i++) {
                    newOffsets.set(i, {
                        x: (Math.random() - 0.5) * 8,
                        y: (Math.random() - 0.5) * 8,
                    });
                }
                
                setCardPositionMap(newMap);
                setCardOffsets(newOffsets);
                
                // Update user jeton count
                await refreshUser();

                // Wait for shuffle to complete, then fan out from center
                setTimeout(() => {
                    animateFanOut().start(() => {
                        if (reading.status === TarotReadingStatus.WAITING) {
                            setPhase('WAITING');
                        } else if (reading.status === TarotReadingStatus.READY) {
                            setPhase('CHOOSING');
                        } else {
                            setPhase('CHOOSING');
                        }
                        setSelectedCards([]);
                        setRevealStep(0);
                    });
                }, 800);
            }
        } catch (err: any) {
            console.error('Error creating tarot reading:', err);
            
            let errorMsg = 'Tarot okunurken bir hata oluştu';
            if (err.message) {
                errorMsg = err.message;
            } else if (err.response?.message) {
                errorMsg = err.response.message;
            } else if (typeof err === 'string') {
                errorMsg = err;
            }
            
            setErrorMessage(errorMsg);
            setShowErrorPopup(true);
            setPhase('INITIAL');
        } finally {
            setLoading(false);
        }
    };

    const handleCardSelect = (cardIndex: number) => {
        // Early return checks
        if (phase !== 'CHOOSING' || !readingData) {
            return;
        }

        // Check if already selected
        if (selectedCards.includes(cardIndex)) {
            return;
        }

        // Check if we already have 3 cards selected
        if (selectedCards.length >= 3) {
            return;
        }

        // User can select any card - no need to check cardPositionMap
        // Backend card info will be used based on selection order during reveal

        // Add to selected - create new array to ensure state update
        const newSelected = [...selectedCards, cardIndex];
        setSelectedCards(newSelected);

        // Initialize highlight animation if not exists
        if (!selectedAnimations[cardIndex]) {
            selectedAnimations[cardIndex] = new Animated.Value(1);
        }

        // Reduced highlight animation (less aggressive)
        Animated.sequence([
            Animated.timing(selectedAnimations[cardIndex], {
                toValue: 1.05,
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(selectedAnimations[cardIndex], {
                toValue: 1.02,
                duration: 100,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        // Immediately show selected card in full-screen
        setShowingCardIndex(cardIndex);
        setPhase('SHOWING_CARD');
        
        // Animate card to full-screen
        fullScreenCardScale.setValue(0.5);
        fullScreenCardOpacity.setValue(0);
        Animated.parallel([
            Animated.timing(fullScreenCardScale, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }),
            Animated.timing(fullScreenCardOpacity, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    };

    const startRevealSequence = () => {
        if (!readingData) return;
        
        setPhase('REVEALING');
        setRevealStep(0);
        revealNextCard();
    };

    const revealNextCard = () => {
        if (!readingData || revealStep >= 3) {
            return;
        }

        // Get the selected card index for this step
        const selectedIndex = selectedCards[revealStep];
        
        // Get card info based on selection order (1st = past, 2nd = present, 3rd = future)
        const positions: ('past' | 'present' | 'future')[] = ['past', 'present', 'future'];
        const position = positions[revealStep];
        
        // Get card info from readingData based on position
        const cardMapping = [readingData.card1, readingData.card2, readingData.card3];
        const cardNames = [readingData.card1Name, readingData.card2Name, readingData.card3Name];
        const cardNumber = cardMapping[revealStep];
        const cardName = cardNames[revealStep];
        
        setRevealingCardIndex(selectedIndex);

        // Hide the grid card temporarily
        const gridAnim = gridAnimations[selectedIndex];
        gridAnim.opacity.setValue(0);

        // Set focused card immediately to show in overlay
        setFocusedCard({ position, cardNumber, cardName, cardIndex: selectedIndex });

        // Animate overlay and card appearance
        Animated.parallel([
            // Overlay backdrop fade in
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            // Card scale and fade in (in overlay, centered)
            Animated.parallel([
                Animated.timing(revealCardScale, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(revealCardOpacity, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    };

    const handleContinueFromFullScreen = () => {
        // Animate card out
        Animated.parallel([
            Animated.timing(fullScreenCardScale, {
                toValue: 0.5,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(fullScreenCardOpacity, {
                toValue: 0,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowingCardIndex(null);
            
            // If 3 cards selected, show info popup
            if (selectedCards.length === 3) {
                setShowInfoPopup(true);
            } else {
                // Return to choosing phase
                setPhase('CHOOSING');
            }
        });
    };

    const handleContinue = () => {
        // Animate overlay out
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(revealCardScale, {
                toValue: 0.8,
                duration: 200,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(revealCardOpacity, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setFocusedCard(null);
            setRevealingCardIndex(null);

            // Reset reveal animations
            revealCardScale.setValue(0.8);
            revealCardOpacity.setValue(0);
            
            // Move to next card
            if (revealStep < 2) {
                setRevealStep(revealStep + 1);
                
                // Show the previous card back in grid (revealed state)
                const prevIndex = selectedCards[revealStep];
                const prevAnim = gridAnimations[prevIndex];
                prevAnim.opacity.setValue(1);
                
                // Reveal next card
                setTimeout(() => {
                    revealNextCard();
                }, 300);
            } else {
                // All cards revealed, show done state
                setPhase('DONE');
                // Show all selected cards in grid (revealed state)
                selectedCards.forEach(index => {
                    const anim = gridAnimations[index];
                    anim.opacity.setValue(1);
                });
            }
        });
    };

    const resetReading = () => {
        setPhase('INITIAL');
        setReadingData(null);
        setSelectedCards([]);
        setRevealStep(0);
        setFocusedCard(null);
        setRevealingCardIndex(null);
        setTimeRemaining(null);
        setShowingCardIndex(null);
        
        // Reset animations - single card visible, others hidden
        stackedAnimations.forEach((anim, index) => {
            anim.translateX.setValue(0);
            anim.translateY.setValue(0);
            anim.rotate.setValue(0);
            anim.scale.setValue(1);
            // First card (single) visible, others hidden
            anim.opacity.setValue(index === 0 ? 1 : 0);
        });
        
        // Reset grid animations
        gridAnimations.forEach(anim => {
            anim.translateX.setValue(0);
            anim.translateY.setValue(0);
            anim.scale.setValue(0);
            anim.opacity.setValue(0);
        });
        
        gridAnimations.forEach(anim => {
            anim.scale.setValue(0);
            anim.opacity.setValue(0);
            anim.translateX.setValue(0);
            anim.translateY.setValue(0);
        });
        
        setCardPositionMap(new Map());
        setCardOffsets(new Map());
        
        gridEntrance.setValue(0);
        
        Object.keys(selectedAnimations).forEach(key => {
            selectedAnimations[parseInt(key)].setValue(1);
        });
        
        overlayOpacity.setValue(0);
        overlayScale.setValue(0.9);
        revealCardScale.setValue(0.8);
        revealCardOpacity.setValue(0);
        fullScreenCardScale.setValue(0.5);
        fullScreenCardOpacity.setValue(0);
    };

    const getErrorTitle = () => {
        if (!errorMessage) return 'Bir şeyler ters gitti';
        
        if (errorMessage.toLowerCase().includes('yıldız') || 
            errorMessage.toLowerCase().includes('jeton') ||
            errorMessage.toLowerCase().includes('yetersiz')) {
            return 'Yetersiz Yıldız';
        }
        
        return 'Bir şeyler ters gitti';
    };

    const getPositionLabel = (position: 'past' | 'present' | 'future') => {
        switch (position) {
            case 'past':
                return 'Geçmiş';
            case 'present':
                return 'Şimdi';
            case 'future':
                return 'Gelecek';
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    const renderSingleCard = () => {
        // Show single closed card in INITIAL phase
        const singleCardAnim = stackedAnimations[0];
        const rotateInterpolate = singleCardAnim.rotate.interpolate({
            inputRange: [-0.2, 0.2],
            outputRange: ['-12deg', '12deg'],
        });
        
        return (
            <View style={styles.singleCardContainer}>
                <Animated.View
                    style={[
                        styles.singleCard,
                        {
                            transform: [
                                { scale: singleCardAnim.scale },
                                { rotate: rotateInterpolate },
                            ],
                            opacity: singleCardAnim.opacity,
                        },
                    ]}>
                    <Image
                        source={TAROT_CARD_BACK}
                        style={styles.singleCardImage}
                        resizeMode="contain"
                    />
                </Animated.View>
            </View>
        );
    };

    const renderStackedDeck = () => {
        // Show stacked deck during SHUFFLING phase
        return (
            <View style={styles.stackedContainer}>
                {stackedAnimations.map((anim, index) => {
                    const rotateInterpolate = anim.rotate.interpolate({
                        inputRange: [-0.2, 0.2],
                        outputRange: ['-12deg', '12deg'],
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.stackedCard,
                                {
                                    transform: [
                                        { translateX: anim.translateX },
                                        { translateY: anim.translateY },
                                        { rotate: rotateInterpolate },
                                        { scale: anim.scale },
                                    ],
                                    opacity: anim.opacity,
                                    zIndex: 4 - index,
                                },
                            ]}>
                            <Image
                                source={TAROT_CARD_BACK}
                                style={styles.stackedCardImage}
                                resizeMode="cover"
                            />
                        </Animated.View>
                    );
                })}
            </View>
        );
    };

    const renderFullScreenCard = () => {
        if (!readingData || showingCardIndex === null) return null;
        
        const selectedIndex = selectedCards.indexOf(showingCardIndex);
        if (selectedIndex === -1) return null;
        
        // Get card info based on selection order (1st = past, 2nd = present, 3rd = future)
        const cardMapping = [readingData.card1, readingData.card2, readingData.card3];
        const cardNames = [readingData.card1Name, readingData.card2Name, readingData.card3Name];
        const cardNumber = cardMapping[selectedIndex];
        const cardName = cardNames[selectedIndex];
        const cardNumberStr = selectedIndex + 1; // 1, 2, or 3
        
        return (
            <Modal
                visible={true}
                transparent
                animationType="none"
                onRequestClose={handleContinueFromFullScreen}>
                <Animated.View
                    style={[
                        styles.fullScreenOverlay,
                        {
                            opacity: fullScreenCardOpacity,
                        },
                    ]}>
                    <View style={styles.fullScreenContent}>
                        {/* Title */}
                        <Text style={styles.fullScreenTitle}>
                            Seçtiğiniz {cardNumberStr}. Kart
                        </Text>
                        
                        {/* Big Card */}
                        <Animated.View
                            style={[
                                styles.fullScreenCardContainer,
                                {
                                    transform: [{ scale: fullScreenCardScale }],
                                },
                            ]}>
                            <Image
                                source={getTarotCardImage(String(cardNumber))}
                                style={styles.fullScreenCardImage}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        
                        {/* Card Name */}
                        <Text style={styles.fullScreenCardName}>
                            {cardName}
                        </Text>
                        
                        {/* Continue Button */}
                        <Button
                            title={selectedIndex === 2 ? 'Tamam' : `${selectedIndex + 2}. Kartı Seç`}
                            onPress={handleContinueFromFullScreen}
                            style={[styles.fullScreenButton, { backgroundColor: COLORS.MAIN }]}
                        />
                    </View>
                </Animated.View>
            </Modal>
        );
    };

    const renderGridCards = () => {
        if (!readingData) return null;

        const rows = 5; // 4x5 grid (20 cards)
        const cols = 4;

        // Grid entrance animation interpolation
        const gridTranslateY = gridEntrance.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0], // More slide for smoother effect
        });

        const gridOpacity = gridEntrance;

        return (
            <View style={styles.gridContainer}>
                {Array.from({ length: GRID_CARD_COUNT }, (_, index) => {
                    const anim = gridAnimations[index];
                    const isSelected = selectedCards.includes(index);
                    const selectedAnim = selectedAnimations[index] || new Animated.Value(1);
                    const isRevealed = phase === 'DONE' && selectedCards.includes(index);
                    
                    const row = Math.floor(index / cols);
                    const col = index % cols;
                    // Get stored random offset for overlapping effect
                    const offset = cardOffsets.get(index) || { x: 0, y: 0 };
                    const x = col * (GRID_CARD_WIDTH + CARD_SPACING) + offset.x;
                    const y = row * (GRID_CARD_HEIGHT + CARD_SPACING) + offset.y;

                    const glowOpacity = isSelected ? selectedAnim.interpolate({
                        inputRange: [1, 1.05],
                        outputRange: [0.4, 0.7],
                    }) : new Animated.Value(0);

                    // Determine z-index: revealing card should be on top
                    const isRevealing = revealingCardIndex === index;
                    const zIndex = isRevealing ? 1000 : (isSelected ? 100 : 10);

                    // Card image - show front if revealed, back otherwise
                    // Get card info based on selection order if revealed
                    let cardImage = TAROT_CARD_BACK;
                    if (isRevealed && readingData) {
                        const selectedIndexInArray = selectedCards.indexOf(index);
                        if (selectedIndexInArray !== -1 && selectedIndexInArray < 3) {
                            const cardMapping = [readingData.card1, readingData.card2, readingData.card3];
                            const cardNumber = cardMapping[selectedIndexInArray];
                            cardImage = getTarotCardImage(String(cardNumber));
                        }
                    }

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.gridCardWrapper,
                                {
                                    left: x,
                                    top: y,
                                    zIndex: zIndex,
                                    transform: [
                                        { translateX: anim.translateX },
                                        { translateY: anim.translateY },
                                        { scale: Animated.multiply(anim.scale, isSelected ? selectedAnim : new Animated.Value(1)) },
                                    ],
                                    opacity: anim.opacity,
                                },
                            ]}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => handleCardSelect(index)}
                                disabled={phase !== 'CHOOSING' || isSelected || selectedCards.length >= 3}>
                                <Animated.View
                                    style={[
                                        styles.gridCard,
                                        isSelected && {
                                            borderWidth: 3,
                                            borderColor: COLORS.MAIN,
                                        },
                                    ]}>
                                    <Image
                                        source={cardImage}
                                        style={styles.gridCardImage}
                                        resizeMode="cover"
                                    />
                                    {isSelected && (
                                        <Animated.View
                                            style={[
                                                styles.cardGlow,
                                                {
                                                    opacity: glowOpacity,
                                                },
                                            ]}
                                        />
                                    )}
                                </Animated.View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 120 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Tarot Falı</Text>
                        <Text style={styles.headerIcon}>🃏</Text>
                    </View>
                    <View style={styles.jetonContainer}>
                        <View style={styles.jetonBadge}>
                            <Text style={styles.jetonIcon}>⭐</Text>
                            <Text style={styles.jetonText}>{user?.jeton || 0}</Text>
                        </View>
                    </View>
                </View>

                {/* Category Selection - Pill Buttons */}
                {phase === 'INITIAL' && (
                    <View style={styles.categoryContainer}>
                        <View style={styles.categoryPills}>
                            {/* Show all available categories, prioritizing reader's categories */}
                            {(() => {
                                const allCategories = Object.values(FalCategory);
                                const readerCategories = reader?.categories || [];
                                // Combine: reader categories first, then add GENEL and PARA if not present
                                const categoriesToShow = [...new Set([
                                    ...readerCategories,
                                    FalCategory.GENEL,
                                    FalCategory.PARA,
                                    ...allCategories.filter(c => !readerCategories.includes(c) && c !== FalCategory.GENEL && c !== FalCategory.PARA)
                                ])];
                                
                                return categoriesToShow.map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.categoryPill,
                                            selectedCategory === category && styles.categoryPillActive,
                                        ]}
                                        onPress={() => setSelectedCategory(category)}>
                                        <Text style={styles.categoryPillIcon}>
                                            {CATEGORY_ICONS[category]}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.categoryPillText,
                                                selectedCategory === category && styles.categoryPillTextActive,
                                            ]}>
                                            {CATEGORY_LABELS[category]}
                                        </Text>
                                    </TouchableOpacity>
                                ));
                            })()}
                        </View>
                    </View>
                )}

                {/* Subtitle */}
                {phase === 'INITIAL' && (
                    <View style={styles.subtitleContainer}>
                        <Text style={styles.subtitle}>
                            Niyetini tut, derin bir nefes al...
                        </Text>
                        <Text style={styles.subtitleSecondary}>
                            3 kart seç ve geçmiş–şimdi–gelecek için kartların ne söylediğini keşfet.
                        </Text>
                    </View>
                )}

                {/* Success Message after 3 cards revealed */}
                {phase === 'DONE' && readingData?.status === TarotReadingStatus.WAITING && (
                    <View style={styles.successMessageContainer}>
                        <Text style={styles.successMessageIcon}>✨</Text>
                        <Text style={styles.successMessageTitle}>Kartlarınız Açıldı!</Text>
                        <Text style={styles.successMessageText}>
                            Falınız 5 dakika içerisinde hazır olacak. Lütfen bekleyin...
                        </Text>
                    </View>
                )}

                {/* Waiting Status */}
                {phase === 'WAITING' && readingData && (
                    <View style={styles.waitingContainer}>
                        <Text style={styles.waitingTitle}>Falınız hazırlanıyor...</Text>
                        {timeRemaining !== null && (
                            <Text style={styles.waitingTime}>
                                Kalan süre: {formatTime(timeRemaining)}
                            </Text>
                        )}
                        <Text style={styles.waitingMessage}>
                            Falınız yaklaşık 3-5 dakika içinde hazır olacak.
                        </Text>
                    </View>
                )}

                {/* Result Text (when READY) */}
                {phase === 'DONE' && readingData?.status === TarotReadingStatus.READY && readingData?.resultText && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>Fal Sonucunuz</Text>
                        <Text style={styles.resultText}>{readingData.resultText}</Text>
                    </View>
                )}

                {/* Content Area */}
                <View style={styles.contentArea}>
                    {phase === 'INITIAL' || phase === 'SHUFFLING' ? (
                        renderSingleCard()
                    ) : phase === 'WAITING' ? (
                        <View style={styles.waitingCardContainer}>
                            <Image
                                source={TAROT_CARD_BACK}
                                style={styles.waitingCard}
                                resizeMode="contain"
                            />
                        </View>
                    ) : (
                        renderGridCards()
                    )}
                </View>
                
                {/* Full-Screen Card Display */}
                {phase === 'SHOWING_CARD' && renderFullScreenCard()}

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {/* Progress indicator */}
                    {phase === 'CHOOSING' && (
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressText}>
                                Seçilen kart: {selectedCards.length}/3
                            </Text>
                        </View>
                    )}

                    {/* Action buttons */}
                    <View style={styles.buttonContainer}>
                        {phase === 'INITIAL' || phase === 'SHUFFLING' ? (
                            <Button
                                title={loading || phase === 'SHUFFLING' ? 'Karıştırılıyor...' : 'Karıştır ve Başla'}
                                onPress={startReading}
                                loading={loading || phase === 'SHUFFLING'}
                                disabled={!selectedCategory}
                                style={[styles.actionButton, { backgroundColor: COLORS.MAIN }]}
                            />
                        ) : phase === 'DONE' ? (
                            <Button
                                title="Yeni Tarot Aç"
                                onPress={resetReading}
                                style={[styles.actionButton, { backgroundColor: COLORS.MAIN }]}
                            />
                        ) : phase === 'WAITING' ? (
                            <Button
                                title="Fallarım"
                                onPress={() => navigation.navigate('TarotHistory')}
                                style={[styles.actionButton, { backgroundColor: COLORS.MAIN }]}
                            />
                        ) : null}
                    </View>
                </View>
            </ScrollView>

            {/* Full-Screen Reveal Overlay - Card centered in true screen center */}
            {focusedCard && (
                <Modal
                    visible={true}
                    transparent
                    animationType="none"
                    onRequestClose={handleContinue}>
                    <Animated.View
                        style={[
                            styles.revealOverlay,
                            {
                                opacity: overlayOpacity,
                            },
                        ]}>
                        <TouchableOpacity
                            style={styles.revealOverlayBackdrop}
                            activeOpacity={1}
                            onPress={() => {}} // Disable backdrop tap
                        />
                        <Animated.View
                            style={[
                                styles.revealContent,
                                {
                                    transform: [{ scale: revealCardScale }],
                                    opacity: revealCardOpacity,
                                },
                            ]}>
                            {/* Big Card - Centered in overlay */}
                            <View style={styles.revealCardContainer}>
                                <Image
                                    source={getTarotCardImage(String(focusedCard.cardNumber))}
                                    style={styles.revealCardImage}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Position Label */}
                            <Text style={styles.revealPositionLabel}>
                                {getPositionLabel(focusedCard.position)}
                            </Text>

                            {/* Card Name */}
                            <Text style={styles.revealCardName}>
                                {focusedCard.cardName}
                            </Text>

                            {/* Continue/Finish Button */}
                            <Button
                                title={revealStep === 2 ? 'Tamam' : 'Devam Et'}
                                onPress={handleContinue}
                                style={[styles.revealCloseButton, { backgroundColor: COLORS.MAIN }]}
                            />
                        </Animated.View>
                    </Animated.View>
                </Modal>
            )}

            {/* Error Popup */}
            <ErrorPopup
                visible={showErrorPopup}
                title={getErrorTitle()}
                message={errorMessage || ''}
                primaryActionLabel="Tamam"
                onPrimaryAction={() => setShowErrorPopup(false)}
                onClose={() => setShowErrorPopup(false)}
            />

            {/* Info Popup - 5 minute wait message */}
            <ErrorPopup
                visible={showInfoPopup}
                title="Kartlarınız Açıldı!"
                message="Falınız 5 dakika içerisinde hazır olacak. Lütfen bekleyiniz."
                icon="✨"
                primaryActionLabel="Tamam"
                onPrimaryAction={() => {
                    setShowInfoPopup(false);
                    // Navigate to tarot history page
                    navigation.navigate('TarotHistory');
                }}
                onClose={() => {
                    setShowInfoPopup(false);
                    // Navigate to tarot history page
                    navigation.navigate('TarotHistory');
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 28,
        color: COLORS.SECOND,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.SECOND,
    },
    headerIcon: {
        fontSize: 24,
    },
    jetonContainer: {
        alignItems: 'flex-end',
    },
    jetonBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.MAIN,
        gap: 4,
    },
    jetonIcon: {
        fontSize: 14,
    },
    jetonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.MAIN,
    },
    subtitleContainer: {
        marginBottom: 16,
        alignItems: 'center',
    },
    categoryContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.SECOND,
        marginBottom: 12,
        textAlign: 'center',
    },
    categoryPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.3)',
        gap: 6,
    },
    categoryPillActive: {
        backgroundColor: 'rgba(224, 195, 108, 0.15)',
        borderColor: COLORS.MAIN,
    },
    categoryPillIcon: {
        fontSize: 14,
    },
    categoryPillText: {
        fontSize: 12,
        color: COLORS.MAIN,
        fontWeight: '500',
    },
    categoryPillTextActive: {
        color: COLORS.MAIN,
        fontWeight: '600',
    },
    successMessageContainer: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.MAIN + '40',
    },
    successMessageIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    successMessageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.MAIN,
        marginBottom: 8,
        textAlign: 'center',
    },
    successMessageText: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.9,
        textAlign: 'center',
        lineHeight: 20,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.SECOND,
        textAlign: 'center',
        marginBottom: 8,
        opacity: 0.9,
    },
    subtitleSecondary: {
        fontSize: 14,
        color: COLORS.SECOND,
        textAlign: 'center',
        opacity: 0.7,
    },
    waitingContainer: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
    },
    waitingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.MAIN,
        marginBottom: 12,
    },
    waitingTime: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 8,
    },
    waitingMessage: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.8,
        textAlign: 'center',
    },
    waitingCardContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    waitingCard: {
        width: STACKED_CARD_WIDTH * 0.6,
        height: STACKED_CARD_HEIGHT * 0.6,
    },
    resultContainer: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.MAIN,
        marginBottom: 16,
        textAlign: 'center',
    },
    resultText: {
        fontSize: 16,
        color: COLORS.SECOND,
        lineHeight: 24,
        textAlign: 'center',
    },
    // Content Area - Flexbox centered for initial card
    contentArea: {
        flex: 1,
        minHeight: SCREEN_HEIGHT * 0.4,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    // Single Card Styles - Initial state
    singleCardContainer: {
        width: STACKED_CARD_WIDTH,
        height: STACKED_CARD_HEIGHT,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    singleCard: {
        width: STACKED_CARD_WIDTH,
        height: STACKED_CARD_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 15,
    },
    singleCardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    // Stacked Deck Styles - During shuffle
    stackedContainer: {
        width: STACKED_CARD_WIDTH + 40,
        height: STACKED_CARD_HEIGHT + 40,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stackedCard: {
        position: 'absolute',
        width: STACKED_CARD_WIDTH,
        height: STACKED_CARD_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 15,
    },
    stackedCardImage: {
        width: '100%',
        height: '100%',
    },
    // Grid Styles - 4x4 grid with overlapping
    gridContainer: {
        width: GRID_CARD_WIDTH * 4 + CARD_SPACING * 3,
        height: GRID_CARD_HEIGHT * 5 + CARD_SPACING * 4, // 5 rows for 20 cards
        position: 'relative',
        alignSelf: 'center',
    },
    gridCardWrapper: {
        position: 'absolute',
        width: GRID_CARD_WIDTH,
        height: GRID_CARD_HEIGHT,
    },
    gridCard: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    gridCardImage: {
        width: '100%',
        height: '100%',
    },
    cardGlow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.MAIN,
        opacity: 0.3,
        borderRadius: 12,
    },
    bottomSection: {
        marginTop: 20,
        paddingBottom: 20,
    },
    progressContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    progressText: {
        fontSize: 16,
        color: COLORS.SECOND,
        fontWeight: '600',
    },
    buttonContainer: {
        marginBottom: 20,
    },
    actionButton: {
        width: '100%',
    },
    // Full-Screen Card Styles
    fullScreenOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenContent: {
        width: SCREEN_WIDTH * 0.9,
        alignItems: 'center',
        paddingVertical: 40,
    },
    fullScreenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 30,
        textAlign: 'center',
    },
    fullScreenCardContainer: {
        width: SCREEN_WIDTH * 0.75,
        height: SCREEN_WIDTH * 0.75 * 1.4,
        marginBottom: 30,
    },
    fullScreenCardImage: {
        width: '100%',
        height: '100%',
    },
    fullScreenCardName: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.MAIN,
        marginBottom: 30,
        textAlign: 'center',
    },
    fullScreenButton: {
        width: '100%',
    },
    // Reveal Overlay Styles - True screen center
    revealOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    revealOverlayBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    revealContent: {
        width: SCREEN_WIDTH * 0.9,
        alignItems: 'center',
        paddingVertical: 30,
    },
    revealCardContainer: {
        width: FOCUSED_CARD_SIZE,
        height: FOCUSED_CARD_SIZE * 1.4,
        marginBottom: 24,
        shadowColor: COLORS.MAIN,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 20,
    },
    revealCardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    revealPositionLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.MAIN,
        marginBottom: 8,
        textAlign: 'center',
    },
    revealCardName: {
        fontSize: 18,
        color: COLORS.SECOND,
        marginBottom: 16,
        textAlign: 'center',
    },
    revealCloseButton: {
        width: '100%',
    },
});

export default TarotReadingScreen;
