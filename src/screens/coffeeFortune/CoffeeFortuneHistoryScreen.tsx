// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '../../components';
import { COLORS } from '../../utils/constants';
import * as coffeeFortuneApi from '../../api/coffeeFortuneApi';
import { CoffeeFortuneResponse, CoffeeFortuneStatus, STATUS_LABELS } from '../../types/coffeeFortune';
import { CATEGORY_LABELS } from '../../types/fortuneWheel';

const CoffeeFortuneHistoryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [fortunes, setFortunes] = useState<CoffeeFortuneResponse[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasNext, setHasNext] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // Calculate bottom padding: tab bar height (70) + tab bar paddingBottom (25) + safe area bottom + extra
    const bottomPadding = 70 + 25 + insets.bottom + 30;

    useEffect(() => {
        loadFortunes(0, true);
    }, []);

    const loadFortunes = async (pageNum: number, reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            const response = await coffeeFortuneApi.getUserCoffeeFortunes(pageNum, size);

            if (response.success && response.data) {
                if (reset) {
                    setFortunes(response.data.fortunes);
                } else {
                    setFortunes((prev) => [...prev, ...response.data.fortunes]);
                }
                setHasNext(response.data.hasNext);
                setPage(pageNum);
            }
        } catch (err: any) {
            console.error('Error loading fortunes:', err);
            setError(err.message || 'Fallar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasNext) {
            loadFortunes(page + 1, false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadFortunes(0, true);
    };

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

    const getCommentExcerpt = (comment: string | null, maxLines: number = 3) => {
        if (!comment) return '';
        const lines = comment.split('\n').slice(0, maxLines);
        return lines.join('\n');
    };

    if (loading && fortunes.length === 0) {
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
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Geçmiş Kahve Fallarım</Text>
                <View style={styles.placeholder} />
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => loadFortunes(0, true)}>
                        <Text style={styles.retryText}>Tekrar Dene</Text>
                    </TouchableOpacity>
                </View>
            )}

            {fortunes.length === 0 && !loading ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>☕</Text>
                    <Text style={styles.emptyTitle}>Henüz kahve falın yok</Text>
                    <Text style={styles.emptyText}>
                        Şimdi bir fincan kahve hazırla ve ilk falını gönder.
                    </Text>
                    <Button
                        title="Kahve Falı Oluştur"
                        onPress={() => navigation.navigate('CoffeeFortune')}
                        style={[styles.emptyButton, { backgroundColor: COLORS.MAIN }]}
                    />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={COLORS.MAIN}
                        />
                    }>
                    {fortunes.map((fortune) => (
                        <View key={fortune.id} style={styles.fortuneCard}>
                            <View style={styles.fortuneCardHeader}>
                                <View style={styles.fortuneCardTop}>
                                    <View style={styles.categoryChip}>
                                        <Text style={styles.categoryChipText}>
                                            {CATEGORY_LABELS[fortune.category]}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.statusTag,
                                            fortune.status === CoffeeFortuneStatus.READY &&
                                                styles.statusTagReady,
                                        ]}>
                                        <Text
                                            style={[
                                                styles.statusTagText,
                                                fortune.status === CoffeeFortuneStatus.READY &&
                                                    styles.statusTagTextReady,
                                            ]}>
                                            {STATUS_LABELS[fortune.status]}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.fortuneDate}>
                                    {formatDateTime(fortune.createdAt)}
                                </Text>
                            </View>

                            {fortune.status === CoffeeFortuneStatus.READY && fortune.comment && (
                                <View style={styles.fortuneComment}>
                                    <Text style={styles.fortuneCommentText}>
                                        {getCommentExcerpt(fortune.comment, 3)}
                                    </Text>
                                </View>
                            )}

                            {fortune.status === CoffeeFortuneStatus.WAITING && (
                                <View style={styles.waitingInfo}>
                                    <Text style={styles.waitingText}>
                                        Falın hazırlanıyor... ☕️
                                    </Text>
                                    {fortune.readyAt && (
                                        <Text style={styles.waitingEta}>
                                            Tahmini: {formatDateTime(fortune.readyAt)}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {fortune.imagePath && (
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: fortune.imagePath }}
                                        style={styles.fortuneImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            )}
                        </View>
                    ))}

                    {hasNext && (
                        <View style={styles.loadMoreContainer}>
                            {loadingMore ? (
                                <ActivityIndicator size="small" color={COLORS.MAIN} />
                            ) : (
                                <Button
                                    title="Daha Fazla Yükle"
                                    onPress={handleLoadMore}
                                    variant="outline"
                                    style={[styles.loadMoreButton, { borderColor: COLORS.MAIN }]}
                                    textStyle={{ color: COLORS.SECOND }}
                                />
                            )}
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
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
        padding: 24,
        paddingBottom: 16,
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
        margin: 24,
        borderRadius: 12,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 0,
        // paddingBottom will be set dynamically based on safe area insets
        maxWidth: 430,
        alignSelf: 'center',
        width: '100%',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    emptyButton: {
        minWidth: 200,
    },
    fortuneCard: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    fortuneCardHeader: {
        marginBottom: 12,
    },
    fortuneCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryChip: {
        backgroundColor: COLORS.MAIN,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
    },
    statusTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusTagReady: {
        backgroundColor: 'rgba(75, 210, 160, 0.2)',
    },
    statusTagText: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.9,
    },
    statusTagTextReady: {
        color: '#4BD2A0',
    },
    fortuneDate: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
    fortuneComment: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    fortuneCommentText: {
        fontSize: 14,
        color: COLORS.SECOND,
        lineHeight: 20,
    },
    waitingInfo: {
        backgroundColor: 'rgba(224, 195, 108, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    waitingText: {
        fontSize: 14,
        color: COLORS.MAIN,
        marginBottom: 4,
    },
    waitingEta: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.8,
    },
    imageContainer: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 8,
    },
    fortuneImage: {
        width: '100%',
        height: '100%',
    },
    loadMoreContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 40, // Extra margin to ensure it's above bottom menu
    },
    loadMoreButton: {
        minWidth: 200,
    },
});

export default CoffeeFortuneHistoryScreen;

