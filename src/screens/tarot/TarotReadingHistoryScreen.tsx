// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text, ErrorPopup } from '../../components';
import { COLORS } from '../../utils/constants';
import * as tarotApi from '../../api/tarotApi';
import { TarotReadingResponseNew, TarotReadingStatus, STATUS_LABELS, CATEGORY_LABELS } from '../../types/tarot';
import { getTarotCardImage } from '../../utils/tarotCards';

const TarotReadingHistoryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [readings, setReadings] = useState<TarotReadingResponseNew[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const pageSize = 10;

    const loadReadings = async (page = 0, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setErrorMessage(null);
            setShowErrorPopup(false);

            const response = await tarotApi.getUserTarotReadings(page, pageSize);
            
            if (response.success && response.data) {
                const { readings: newReadings, currentPage: pageNum, totalPages, hasNext: hasMore } = response.data;
                
                if (append) {
                    setReadings(prev => [...prev, ...newReadings]);
                } else {
                    setReadings(newReadings);
                }
                
                setCurrentPage(pageNum);
                setTotalPages(totalPages);
                setHasNext(hasMore);
            }
        } catch (err: any) {
            console.error('Error loading tarot readings:', err);
            
            let errorMsg = 'Fallar yüklenirken bir hata oluştu';
            if (err.message) {
                errorMsg = err.message;
            } else if (err.response?.message) {
                errorMsg = err.response.message;
            }
            
            setErrorMessage(errorMsg);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadReadings(0, false);
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadReadings(0, false);
    };

    const loadMore = () => {
        if (!loadingMore && hasNext && !loading) {
            loadReadings(currentPage + 1, true);
        }
    };

    const handleReadingPress = async (reading: TarotReadingResponseNew) => {
        // Navigate to reading detail screen
        navigation.navigate('TarotReadingDetail', { 
            readingId: reading.id,
            reading: reading, // Pass reading data to avoid extra API call
        });
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

    const getErrorTitle = () => {
        if (!errorMessage) return 'Bir şeyler ters gitti';
        return 'Hata';
    };

    const renderReadingCard = (reading: TarotReadingResponseNew) => {
        const statusColor = reading.status === TarotReadingStatus.READY 
            ? COLORS.MAIN 
            : reading.status === TarotReadingStatus.WAITING
            ? '#FFA500'
            : COLORS.SECOND;

        return (
            <TouchableOpacity
                key={reading.id}
                style={styles.readingCard}
                onPress={() => handleReadingPress(reading)}
                activeOpacity={0.7}>
                <View style={styles.readingCardHeader}>
                    <View style={styles.readingCardHeaderLeft}>
                        <Text style={styles.readingCategory}>
                            {CATEGORY_LABELS[reading.category]}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {STATUS_LABELS[reading.status]}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.readingDate}>
                        {formatDate(reading.createdAt)}
                    </Text>
                </View>

                {/* Cards Preview */}
                <View style={styles.cardsPreview}>
                    <View style={styles.cardPreview}>
                        <Image
                            source={getTarotCardImage(String(reading.card1))}
                            style={styles.cardPreviewImage}
                            resizeMode="cover"
                        />
                        <Text style={styles.cardPreviewName} numberOfLines={1}>
                            {reading.card1Name}
                        </Text>
                    </View>
                    <View style={styles.cardPreview}>
                        <Image
                            source={getTarotCardImage(String(reading.card2))}
                            style={styles.cardPreviewImage}
                            resizeMode="cover"
                        />
                        <Text style={styles.cardPreviewName} numberOfLines={1}>
                            {reading.card2Name}
                        </Text>
                    </View>
                    <View style={styles.cardPreview}>
                        <Image
                            source={getTarotCardImage(String(reading.card3))}
                            style={styles.cardPreviewImage}
                            resizeMode="cover"
                        />
                        <Text style={styles.cardPreviewName} numberOfLines={1}>
                            {reading.card3Name}
                        </Text>
                    </View>
                </View>

                {/* Result Preview (if READY) */}
                {reading.status === TarotReadingStatus.READY && reading.resultText && (
                    <View style={styles.resultPreview}>
                        <Text style={styles.resultPreviewText} numberOfLines={3}>
                            {reading.resultText}
                        </Text>
                    </View>
                )}

                {/* Waiting Message */}
                {reading.status === TarotReadingStatus.WAITING && reading.readyAt && (
                    <View style={styles.waitingInfo}>
                        <Text style={styles.waitingInfoText}>
                            Falınız hazırlanıyor... Hazır olma zamanı: {formatDate(reading.readyAt)}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 100 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.MAIN}
                    />
                }>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tarot Fallarım</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Loading */}
                {loading && readings.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.MAIN} />
                        <Text style={styles.loadingText}>Fallar yükleniyor...</Text>
                    </View>
                ) : readings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Henüz tarot falınız bulunmuyor
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.readingsList}>
                            {readings.map(reading => renderReadingCard(reading))}
                        </View>

                        {/* Load More */}
                        {hasNext && (
                            <View style={styles.loadMoreContainer}>
                                {loadingMore ? (
                                    <ActivityIndicator size="small" color={COLORS.MAIN} />
                                ) : (
                                    <TouchableOpacity
                                        style={styles.loadMoreButton}
                                        onPress={loadMore}>
                                        <Text style={styles.loadMoreText}>Daha fazla yükle</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </>
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
        minHeight: 200,
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
        minHeight: 200,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.SECOND,
        opacity: 0.7,
        textAlign: 'center',
    },
    readingsList: {
        gap: 16,
    },
    readingCard: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    readingCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    readingCardHeaderLeft: {
        flex: 1,
    },
    readingCategory: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.MAIN,
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    readingDate: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.7,
        textAlign: 'right',
    },
    cardsPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 8,
    },
    cardPreview: {
        flex: 1,
        alignItems: 'center',
    },
    cardPreviewImage: {
        width: 60,
        height: 84,
        borderRadius: 8,
        marginBottom: 8,
    },
    cardPreviewName: {
        fontSize: 10,
        color: COLORS.SECOND,
        opacity: 0.8,
        textAlign: 'center',
    },
    resultPreview: {
        backgroundColor: 'rgba(224, 195, 108, 0.1)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.MAIN + '40',
    },
    resultPreviewText: {
        fontSize: 14,
        color: COLORS.SECOND,
        lineHeight: 20,
    },
    waitingInfo: {
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#FFA50040',
    },
    waitingInfoText: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.8,
    },
    loadMoreContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    loadMoreButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.MAIN,
        borderRadius: 12,
    },
    loadMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
});

export default TarotReadingHistoryScreen;

