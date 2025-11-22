// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '../../components';
import ErrorPopup from '../../components/ErrorPopup';
import { COLORS } from '../../utils/constants';
import * as coffeeFortuneApi from '../../api/coffeeFortuneApi';
import { FalCategory, CATEGORY_LABELS } from '../../types/fortuneWheel';
import { CoffeeFortuneResponse, CoffeeFortuneStatus } from '../../types/coffeeFortune';
import { takePhoto, pickFromGallery } from '../../utils/imagePicker';

const CoffeeFortuneScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState<FalCategory | null>(null);
    const [selectedImage, setSelectedImage] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [creating, setCreating] = useState(false);
    const [latestFortune, setLatestFortune] = useState<CoffeeFortuneResponse | null>(null);
    const [loadingLatest, setLoadingLatest] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;
    
    // Calculate bottom padding: tab bar height (70) + tab bar paddingBottom (25) + safe area bottom + extra
    const bottomPadding = 70 + 25 + insets.bottom + 30;

    useEffect(() => {
        loadLatestFortune();
        
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();

        // Glow pulse animation
        const glowAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.8,
                    duration: 1500,
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.5,
                    duration: 1500,
                    useNativeDriver: false,
                }),
            ])
        );
        glowAnimation.start();

        return () => {
            glowAnimation.stop();
        };
    }, []);

    const loadLatestFortune = async () => {
        try {
            setLoadingLatest(true);
            const response = await coffeeFortuneApi.getUserCoffeeFortunes(0, 1);
            if (response.success && response.data && response.data.fortunes.length > 0) {
                setLatestFortune(response.data.fortunes[0]);
            }
        } catch (err: any) {
            console.error('Error loading latest fortune:', err);
        } finally {
            setLoadingLatest(false);
        }
    };

    const handleTakePhoto = async () => {
        const image = await takePhoto();
        if (image) {
            setSelectedImage(image);
            setErrorMessage(null);
        }
    };

    const handlePickFromGallery = async () => {
        const image = await pickFromGallery();
        if (image) {
            setSelectedImage(image);
            setErrorMessage(null);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCategory || !selectedImage) {
            setErrorMessage('Lütfen kategori seçin ve fotoğraf yükleyin');
            setShowErrorPopup(true);
            return;
        }

        try {
            setCreating(true);
            setErrorMessage(null);
            setShowErrorPopup(false);
            setSuccessMessage(null);

            const response = await coffeeFortuneApi.createCoffeeFortune(
                { category: selectedCategory },
                selectedImage
            );

            if (response.success && response.data) {
                setLatestFortune(response.data);
                setSuccessMessage('Falın gönderildi! 5-8 dakika içinde hazır olacak.');
                setSelectedImage(null);
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 5000);
            }
        } catch (err: any) {
            console.error('Error creating coffee fortune:', err);
            
            // Parse error message from backend
            let errorMsg = 'Fal gönderilirken bir hata oluştu';
            if (err.message) {
                errorMsg = err.message;
            } else if (err.response?.message) {
                errorMsg = err.response.message;
            } else if (typeof err === 'string') {
                errorMsg = err;
            }
            
            setErrorMessage(errorMsg);
            setShowErrorPopup(true);
        } finally {
            setCreating(false);
        }
    };

    const getErrorTitle = () => {
        if (!errorMessage) return 'Bir şeyler ters gitti';
        
        // Check for specific error cases
        if (errorMessage.toLowerCase().includes('yıldız') || 
            errorMessage.toLowerCase().includes('jeton') ||
            errorMessage.toLowerCase().includes('yetersiz')) {
            return 'Yetersiz Yıldız';
        }
        
        return 'Bir şeyler ters gitti';
    };

    const categories = [
        FalCategory.ASK,
        FalCategory.KARIYER,
        FalCategory.PARA,
        FalCategory.SAGLIK,
        FalCategory.AILE,
        FalCategory.GENEL,
    ];

    const formatDateTime = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.6],
    });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
                    showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Kahve Falı</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Success Message */}
                    {successMessage && (
                        <View style={styles.successContainer}>
                            <Text style={styles.successText}>{successMessage}</Text>
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

                    {/* Photo Area */}
                    <View style={styles.photoContainer}>
                        <Animated.View
                            style={[
                                styles.photoCard,
                                {
                                    shadowOpacity: glowOpacity,
                                },
                            ]}>
                            {selectedImage ? (
                                <View style={styles.photoPreview}>
                                    <Image
                                        source={{ uri: selectedImage.uri }}
                                        style={styles.photoImage}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={styles.removePhotoButton}
                                        onPress={() => setSelectedImage(null)}>
                                        <Text style={styles.removePhotoText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Text style={styles.photoPlaceholderIcon}>☕</Text>
                                    <Text style={styles.photoPlaceholderText}>
                                        Fincan fotoğrafı yükle
                                    </Text>
                                </View>
                            )}
                        </Animated.View>

                        <View style={styles.photoActions}>
                            <Button
                                title="Kamera ile Çek"
                                onPress={handleTakePhoto}
                                variant="outline"
                                style={[styles.photoButton, { borderColor: COLORS.MAIN }]}
                                textStyle={{ color: COLORS.SECOND }}
                            />
                            <Button
                                title="Galeriden Seç"
                                onPress={handlePickFromGallery}
                                variant="outline"
                                style={[styles.photoButton, { borderColor: COLORS.MAIN }]}
                                textStyle={{ color: COLORS.SECOND }}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <View style={styles.submitContainer}>
                        <Button
                            title={creating ? 'Gönderiliyor...' : 'Falını Gönder'}
                            onPress={handleSubmit}
                            loading={creating}
                            disabled={!selectedCategory || !selectedImage || creating}
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor:
                                        selectedCategory && selectedImage && !creating
                                            ? COLORS.MAIN
                                            : '#666',
                                },
                            ]}
                        />
                    </View>

                    {/* Current Fortune Status */}
                    {loadingLatest ? (
                        <View style={styles.statusCard}>
                            <ActivityIndicator size="small" color={COLORS.MAIN} />
                            <Text style={styles.statusText}>Yükleniyor...</Text>
                        </View>
                    ) : latestFortune ? (
                        latestFortune.status === CoffeeFortuneStatus.WAITING ? (
                            <Animated.View
                                style={[
                                    styles.statusCard,
                                    styles.waitingCard,
                                    {
                                        shadowOpacity: glowOpacity,
                                    },
                                ]}>
                                <ActivityIndicator size="small" color={COLORS.MAIN} />
                                <Text style={styles.statusTitle}>
                                    Kahve falın hazırlanıyor ☕️
                                </Text>
                                <Text style={styles.statusText}>
                                    Yaklaşık 5-8 dakika içinde hazır olacak.
                                </Text>
                                {latestFortune.readyAt && (
                                    <Text style={styles.etaText}>
                                        Tahmini hazır olma zamanı:{' '}
                                        {formatDateTime(latestFortune.readyAt)}
                                    </Text>
                                )}
                                <TouchableOpacity
                                    style={styles.historyLink}
                                    onPress={() => navigation.navigate('CoffeeFortuneHistory')}>
                                    <Text style={styles.historyLinkText}>
                                        Geçmiş fallarım →
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ) : latestFortune.status === CoffeeFortuneStatus.READY ? (
                            <Animated.View
                                style={[
                                    styles.statusCard,
                                    styles.readyCard,
                                    {
                                        shadowOpacity: glowOpacity,
                                    },
                                ]}>
                                <View style={styles.fortuneHeader}>
                                    <View style={styles.fortuneCategory}>
                                        <Text style={styles.fortuneCategoryLabel}>Kategori:</Text>
                                        <Text style={styles.fortuneCategoryValue}>
                                            {CATEGORY_LABELS[latestFortune.category]}
                                        </Text>
                                    </View>
                                    <Text style={styles.fortuneDate}>
                                        {formatDateTime(latestFortune.createdAt)}
                                    </Text>
                                </View>
                                <View style={styles.fortuneComment}>
                                    <Text style={styles.fortuneCommentText}>
                                        {latestFortune.comment}
                                    </Text>
                                </View>
                            </Animated.View>
                        ) : null
                    ) : null}
                </ScrollView>
            </Animated.View>

            {/* Error Popup */}
            <ErrorPopup
                visible={showErrorPopup}
                title={getErrorTitle()}
                message={errorMessage || ''}
                primaryActionLabel="Tamam"
                onPrimaryAction={() => setShowErrorPopup(false)}
                onClose={() => setShowErrorPopup(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        // paddingBottom will be set dynamically based on safe area insets
        maxWidth: 430,
        alignSelf: 'center',
        width: '100%',
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
    successContainer: {
        backgroundColor: 'rgba(75, 210, 160, 0.2)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    successText: {
        color: '#4BD2A0',
        fontSize: 14,
        textAlign: 'center',
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
    photoContainer: {
        marginBottom: 32,
    },
    photoCard: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: COLORS.MAIN,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 12,
        elevation: 8,
    },
    photoPreview: {
        position: 'relative',
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    removePhotoButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removePhotoText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    photoPlaceholder: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholderIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    photoPlaceholderText: {
        fontSize: 16,
        color: COLORS.SECOND,
        opacity: 0.8,
    },
    photoActions: {
        flexDirection: 'row',
        gap: 12,
    },
    photoButton: {
        flex: 1,
    },
    submitContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    submitButton: {
        minWidth: 200,
    },
    statusCard: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 20,
        shadowColor: COLORS.MAIN,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 12,
        elevation: 8,
    },
    waitingCard: {
        alignItems: 'center',
    },
    readyCard: {},
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    statusText: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.9,
        textAlign: 'center',
        marginBottom: 8,
    },
    etaText: {
        fontSize: 12,
        color: COLORS.MAIN,
        textAlign: 'center',
        marginTop: 8,
    },
    historyLink: {
        marginTop: 16,
    },
    historyLinkText: {
        fontSize: 14,
        color: COLORS.MAIN,
        fontWeight: '600',
    },
    fortuneHeader: {
        marginBottom: 16,
    },
    fortuneCategory: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    fortuneCategoryLabel: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.9,
        marginRight: 8,
    },
    fortuneCategoryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.MAIN,
    },
    fortuneDate: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
    fortuneComment: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 12,
    },
    fortuneCommentText: {
        fontSize: 16,
        color: COLORS.SECOND,
        lineHeight: 24,
    },
});

export default CoffeeFortuneScreen;

