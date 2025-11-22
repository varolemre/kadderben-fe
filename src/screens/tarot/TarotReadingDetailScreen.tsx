// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, ErrorPopup } from '../../components';
import { COLORS } from '../../utils/constants';
import * as tarotApi from '../../api/tarotApi';
import { TarotReadingResponseNew, TarotReadingStatus, STATUS_LABELS, CATEGORY_LABELS } from '../../types/tarot';
import { getTarotCardImage } from '../../utils/tarotCards';

const TarotReadingDetailScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const readingId = route?.params?.readingId;
    const initialReading = route?.params?.reading;
    
    const [reading, setReading] = useState<TarotReadingResponseNew | null>(initialReading || null);
    const [loading, setLoading] = useState(!initialReading);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (readingId && !initialReading) {
            loadReading();
        }
    }, [readingId]);

    // Timer for WAITING status
    useEffect(() => {
        if (reading?.status === TarotReadingStatus.WAITING && reading?.readyAt) {
            const updateTimer = () => {
                const now = new Date().getTime();
                const readyAt = new Date(reading.readyAt).getTime();
                const remaining = Math.max(0, Math.floor((readyAt - now) / 1000));
                setTimeRemaining(remaining);
                
                if (remaining <= 0) {
                    checkReadingStatus();
                }
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [reading]);

    const loadReading = async () => {
        if (!readingId) return;
        
        setLoading(true);
        setErrorMessage(null);
        setShowErrorPopup(false);

        try {
            const response = await tarotApi.getTarotReading(readingId);
            if (response.success && response.data) {
                setReading(response.data);
            }
        } catch (err: any) {
            console.error('Error loading reading:', err);
            
            let errorMsg = 'Fal yüklenirken bir hata oluştu';
            if (err.message) {
                errorMsg = err.message;
            } else if (err.response?.message) {
                errorMsg = err.response.message;
            }
            
            setErrorMessage(errorMsg);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const checkReadingStatus = async () => {
        if (!reading?.id) return;
        
        try {
            const response = await tarotApi.getTarotReading(reading.id);
            if (response.success && response.data) {
                setReading(response.data);
            }
        } catch (err) {
            console.error('Error checking reading status:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getErrorTitle = () => {
        if (!errorMessage) return 'Bir şeyler ters gitti';
        return 'Hata';
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.MAIN} />
                    <Text style={styles.loadingText}>Fal yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!reading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Fal bulunamadı</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusColor = reading.status === TarotReadingStatus.READY 
        ? COLORS.MAIN 
        : reading.status === TarotReadingStatus.WAITING
        ? '#FFA500'
        : COLORS.SECOND;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 100 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Fal Detayı</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Reading Info */}
                <View style={styles.infoCard}>
                    {reading.readerName && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Falcı:</Text>
                            <Text style={styles.infoValue}>{reading.readerName}</Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kategori:</Text>
                        <Text style={styles.infoValue}>{CATEGORY_LABELS[reading.category]}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Durum:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {STATUS_LABELS[reading.status]}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tarih:</Text>
                        <Text style={styles.infoValue}>{formatDate(reading.createdAt)}</Text>
                    </View>
                    {reading.readyAt && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Hazır Olma:</Text>
                            <Text style={styles.infoValue}>{formatDate(reading.readyAt)}</Text>
                        </View>
                    )}
                </View>

                {/* Waiting Status */}
                {reading.status === TarotReadingStatus.WAITING && (
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

                {/* Cards */}
                <View style={styles.cardsSection}>
                    <Text style={styles.sectionTitle}>Kartlarınız</Text>
                    <View style={styles.cardsContainer}>
                        <View style={styles.cardItem}>
                            <Text style={styles.cardPositionLabel}>Geçmiş</Text>
                            <Image
                                source={getTarotCardImage(String(reading.card1))}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.cardName}>{reading.card1Name}</Text>
                        </View>
                        <View style={styles.cardItem}>
                            <Text style={styles.cardPositionLabel}>Şimdi</Text>
                            <Image
                                source={getTarotCardImage(String(reading.card2))}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.cardName}>{reading.card2Name}</Text>
                        </View>
                        <View style={styles.cardItem}>
                            <Text style={styles.cardPositionLabel}>Gelecek</Text>
                            <Image
                                source={getTarotCardImage(String(reading.card3))}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.cardName}>{reading.card3Name}</Text>
                        </View>
                    </View>
                </View>

                {/* Result Text (if READY) */}
                {reading.status === TarotReadingStatus.READY && reading.resultText && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>Fal Sonucunuz</Text>
                        <Text style={styles.resultText}>{reading.resultText}</Text>
                    </View>
                )}
            </ScrollView>

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
        marginBottom: 24,
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.SECOND,
    },
    placeholder: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
    infoCard: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.SECOND,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
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
    cardsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.MAIN,
        marginBottom: 16,
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cardItem: {
        flex: 1,
        alignItems: 'center',
    },
    cardPositionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.MAIN,
        marginBottom: 8,
    },
    cardImage: {
        width: 80,
        height: 112,
        borderRadius: 8,
        marginBottom: 8,
    },
    cardName: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.8,
        textAlign: 'center',
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
});

export default TarotReadingDetailScreen;

