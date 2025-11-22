// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Animated,
    Easing,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components';
import { COLORS } from '../../utils/constants';
import * as fortuneWheelApi from '../../api/fortuneWheelApi';
import { FalCategory, CATEGORY_LABELS, WheelStatusResponse, SpinWheelResponse } from '../../types/fortuneWheel';

const wheelImage = require('../../assets/img/wheel.png');

// Category-based theme colors
const CATEGORY_THEMES: Record<FalCategory, { primary: string; glow: string }> = {
    ASK: { primary: '#FF4B87', glow: 'rgba(255, 75, 135, 0.35)' }, // pink / love
    KARIYER: { primary: '#4C8DFF', glow: 'rgba(76, 141, 255, 0.35)' }, // blue / career
    PARA: { primary: '#E0C36C', glow: 'rgba(224, 195, 108, 0.35)' }, // gold / money
    SAGLIK: { primary: '#4BD2A0', glow: 'rgba(75, 210, 160, 0.35)' }, // green / health
    AILE: { primary: '#FF9F43', glow: 'rgba(255, 159, 67, 0.35)' }, // warm orange / family
    GENEL: { primary: COLORS.MAIN, glow: 'rgba(180, 120, 255, 0.35)' }, // default / generic
};

const WheelScreen = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState<FalCategory>(FalCategory.GENEL);
    const [status, setStatus] = useState<WheelStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SpinWheelResponse | null>(null);
    const [showResult, setShowResult] = useState(false);

    const spinAnimation = useRef(new Animated.Value(0)).current;
    const spinButtonScale = useRef(new Animated.Value(1)).current;
    const spinButtonAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

    // Get current theme based on selected category
    const theme = CATEGORY_THEMES[selectedCategory];

    useEffect(() => {
        loadStatus();
    }, []);

    // Start/stop spin button animation based on canSpin and spinning state
    useEffect(() => {
        if (!status) return;

        const shouldAnimate = canSpin() && !spinning;

        if (shouldAnimate) {
            startSpinButtonAnimation();
        } else {
            stopSpinButtonAnimation();
        }

        return () => {
            stopSpinButtonAnimation();
        };
    }, [status, spinning, selectedCategory]);

    const startSpinButtonAnimation = () => {
        // Stop any existing animation
        if (spinButtonAnimationRef.current) {
            spinButtonAnimationRef.current.stop();
        }

        // Reset values
        spinButtonScale.setValue(1);

        // Start loop animation - only scale, no shake
        spinButtonAnimationRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(spinButtonScale, {
                    toValue: 1.02,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(spinButtonScale, {
                    toValue: 1.0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        spinButtonAnimationRef.current.start();
    };

    const stopSpinButtonAnimation = () => {
        if (spinButtonAnimationRef.current) {
            spinButtonAnimationRef.current.stop();
            spinButtonAnimationRef.current = null;
        }
        // Reset to default value
        Animated.timing(spinButtonScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const loadStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fortuneWheelApi.getWheelStatus();
            if (response.success && response.data) {
                setStatus(response.data);
            }
        } catch (err: any) {
            console.error('Error loading wheel status:', err);
            setError(err.message || 'Durum bilgisi yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const canSpin = () => {
        if (!status) return false;
        return status.canSpinForFree || (status.canSpinWithJetons && status.currentJetons > 0);
    };

    const handleSpin = async () => {
        if (spinning || !canSpin()) return;

        try {
            setSpinning(true);
            setError(null);

            // Start spin animation
            spinAnimation.setValue(0);
            Animated.timing(spinAnimation, {
                toValue: 1,
                duration: 3000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();

            // Call API
            const response = await fortuneWheelApi.spinWheel({
                category: selectedCategory,
                useFreeSpinIfAvailable: true,
            });

            if (response.success && response.data) {
                // Wait for animation to complete
                setTimeout(() => {
                    setResult(response.data);
                    setShowResult(true);
                    // Update status
                    if (response.data) {
                        setStatus(prev => prev ? {
                            ...prev,
                            currentJetons: response.data.remainingJetons,
                            canSpinForFree: false,
                            nextFreeSpinAvailable: response.data.nextFreeSpinAvailable,
                        } : null);
                    }
                    setSpinning(false);
                }, 3000);
            }
        } catch (err: any) {
            console.error('Error spinning wheel:', err);
            setError(err.message || 'Çark çevrilirken bir hata oluştu');
            setSpinning(false);
            spinAnimation.setValue(0);
        }
    };

    const spinRotation = spinAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '1080deg'], // 3 full rotations
    });

    const categories = [
        FalCategory.ASK,
        FalCategory.KARIYER,
        FalCategory.PARA,
        FalCategory.SAGLIK,
        FalCategory.AILE,
        FalCategory.GENEL,
    ];

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.MAIN} />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Çark Falı</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Error Message */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={loadStatus}>
                            <Text style={styles.retryText}>Tekrar Dene</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Category Selection */}
                <View style={styles.categoryContainer}>
                    <Text style={styles.sectionTitle}>Kategori Seçin</Text>
                    <View style={styles.categoryPills}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categoryPill,
                                    selectedCategory === category && styles.categoryPillActive,
                                ]}
                                onPress={() => setSelectedCategory(category)}>
                                <Text
                                    style={[
                                        styles.categoryPillText,
                                        selectedCategory === category && styles.categoryPillTextActive,
                                    ]}>
                                    {CATEGORY_LABELS[category]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Status Info */}
                {status && (
                    <View style={styles.statusContainer}>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Jetonlarınız:</Text>
                            <Text style={styles.statusValue}>{status.currentJetons}</Text>
                        </View>
                        {status.canSpinForFree && (
                            <Text style={[styles.freeSpinText, { color: theme.primary }]}>
                                ✨ Ücretsiz çevirme hakkınız var!
                            </Text>
                        )}
                        {status.nextFreeSpinAvailable && !status.canSpinForFree && (
                            <Text style={styles.nextSpinText}>
                                Sonraki ücretsiz çevirme: {(() => {
                                    try {
                                        return new Date(status.nextFreeSpinAvailable).toLocaleString('tr-TR', { 
                                            day: '2-digit', 
                                            month: '2-digit', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        });
                                    } catch {
                                        return 'Yakında';
                                    }
                                })()}
                            </Text>
                        )}
                    </View>
                )}

                {/* Wheel */}
                <View style={styles.wheelContainer}>
                    <View style={styles.pointerContainer}>
                        <View style={[styles.pointer, { borderBottomColor: theme.primary }]} />
                    </View>
                    <Animated.Image
                        source={wheelImage}
                        style={[
                            styles.wheelImage,
                            {
                                transform: [{ rotate: spinRotation }],
                            },
                        ]}
                        resizeMode="contain"
                    />
                </View>

                {/* Spin Button */}
                <View style={styles.buttonContainer}>
                    <Animated.View
                        style={[
                            styles.spinButtonWrapper,
                            {
                                transform: [
                                    { scale: spinButtonScale },
                                ],
                                shadowColor: canSpin() && !spinning ? theme.primary : 'transparent',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.5,
                                shadowRadius: 12,
                                elevation: canSpin() && !spinning ? 8 : 0,
                            },
                        ]}>
                        <Button
                            title={spinning ? 'Çevriliyor...' : 'Çarkı Çevir'}
                            onPress={handleSpin}
                            loading={spinning}
                            disabled={!canSpin() || spinning}
                            style={[
                                styles.spinButton,
                                { backgroundColor: canSpin() && !spinning ? theme.primary : '#666' },
                            ]}
                        />
                    </Animated.View>
                    {!canSpin() && status && (
                        <Text style={styles.cannotSpinText}>
                            Şu an ücretsiz hakkınız yok ve yeterli jetonunuz bulunmuyor.
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Result Modal */}
            <Modal
                visible={showResult}
                transparent
                animationType="fade"
                onRequestClose={() => setShowResult(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Fal Sonucunuz ✨</Text>
                        {result && (
                            <>
                                <View style={styles.resultCategory}>
                                    <Text style={styles.resultCategoryLabel}>Kategori:</Text>
                                    <Text style={styles.resultCategoryValue}>
                                        {CATEGORY_LABELS[result.category]}
                                    </Text>
                                </View>
                                <View style={styles.resultComment}>
                                    <Text style={styles.resultCommentText}>{result.comment}</Text>
                                </View>
                                <View style={styles.resultInfo}>
                                    {result.wasFreeSpinUsed ? (
                                        <Text style={styles.resultInfoText}>✨ Ücretsiz çevirme kullanıldı</Text>
                                    ) : (
                                        <Text style={styles.resultInfoText}>
                                            💰 {result.jetonSpent} jeton harcandı
                                        </Text>
                                    )}
                                    <Text style={styles.resultInfoText}>
                                        Kalan jeton: {result.remainingJetons}
                                    </Text>
                                </View>
                                <Button
                                    title="Tamam"
                                    onPress={() => {
                                        setShowResult(false);
                                        setResult(null);
                                    }}
                                    style={[styles.modalButton, { backgroundColor: COLORS.MAIN }]}
                                />
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
    content: {
        padding: 24,
        paddingBottom: 32,
        maxWidth: 430,
        alignSelf: 'center',
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.SECOND,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    backButtonText: {
        fontSize: 24,
        color: COLORS.SECOND,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.SECOND,
    },
    placeholder: {
        width: 40,
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
    retryText: {
        color: COLORS.MAIN,
        fontSize: 14,
        fontWeight: '600',
    },
    categoryContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.SECOND,
        marginBottom: 16,
    },
    categoryPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    categoryPillActive: {
        backgroundColor: COLORS.MAIN,
        borderColor: COLORS.MAIN,
    },
    categoryPillText: {
        fontSize: 14,
        color: COLORS.SECOND,
    },
    categoryPillTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    statusContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusLabel: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.9,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.MAIN,
    },
    freeSpinText: {
        fontSize: 14,
        color: COLORS.MAIN,
        marginTop: 8,
        fontWeight: '600',
    },
    nextSpinText: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.8,
        marginTop: 8,
    },
    wheelContainer: {
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
    },
    pointerContainer: {
        position: 'absolute',
        top: -10,
        zIndex: 2,
        alignItems: 'center',
    },
    pointer: {
        width: 0,
        height: 0,
        borderLeftWidth: 12,
        borderRightWidth: 12,
        borderBottomWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: COLORS.MAIN,
    },
    wheelImage: {
        width: 280,
        height: 280,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    spinButtonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinButton: {
        minWidth: 200,
        marginBottom: 12,
    },
    cannotSpinText: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.8,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 12,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 24,
        textAlign: 'center',
    },
    resultCategory: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    resultCategoryLabel: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.9,
        marginRight: 8,
    },
    resultCategoryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.MAIN,
    },
    resultComment: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        minHeight: 100,
    },
    resultCommentText: {
        fontSize: 16,
        color: COLORS.SECOND,
        lineHeight: 24,
        textAlign: 'center',
    },
    resultInfo: {
        marginBottom: 24,
        gap: 8,
    },
    resultInfoText: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.9,
        textAlign: 'center',
    },
    modalButton: {
        width: '100%',
    },
});

export default WheelScreen;

