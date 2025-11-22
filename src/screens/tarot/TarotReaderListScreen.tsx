// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, ErrorPopup } from '../../components';
import { COLORS } from '../../utils/constants';
import * as tarotApi from '../../api/tarotApi';
import { TarotReaderResponse, FalCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '../../types/tarot';
import useAuthStore from '../../store/authStore';
import { useFocusEffect } from '@react-navigation/native';

const TarotReaderListScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, refreshUser } = useAuthStore();
    const [readers, setReaders] = useState<TarotReaderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    // Refresh user info when screen comes into focus to get latest jeton count
    useFocusEffect(
        React.useCallback(() => {
            refreshUser();
        }, [refreshUser])
    );

    useEffect(() => {
        loadReaders();
    }, []);

    const loadReaders = async () => {
        setLoading(true);
        setErrorMessage(null);
        setShowErrorPopup(false);

        try {
            const response = await tarotApi.getAllReaders();
            if (response.success && response.data) {
                // Filter only active readers
                const activeReaders = response.data.filter((reader: TarotReaderResponse) => reader.isActive);
                setReaders(activeReaders);
            }
        } catch (err: any) {
            console.error('Error loading readers:', err);
            
            let errorMsg = 'Falcılar yüklenirken bir hata oluştu';
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

    const handleReaderPress = (reader: TarotReaderResponse) => {
        navigation.navigate('TarotReading', { reader });
    };

    const getErrorTitle = () => {
        if (!errorMessage) return 'Bir şeyler ters gitti';
        return 'Hata';
    };

    const SkeletonCard = () => {
        const shimmerAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const shimmer = Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnim, {
                        toValue: 0,
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                ])
            );
            shimmer.start();
            return () => shimmer.stop();
        }, []);

        const opacity = shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
        });

        return (
            <View style={styles.readerCard}>
                <View style={styles.readerCardContent}>
                    {/* Avatar Skeleton */}
                    <View style={styles.avatarSection}>
                        <Animated.View style={[styles.skeletonAvatar, { opacity }]} />
                        <Animated.View style={[styles.skeletonRating, { opacity }]} />
                    </View>
                    
                    {/* Info Skeleton */}
                    <View style={styles.readerInfo}>
                        <Animated.View style={[styles.skeletonName, { opacity }]} />
                        <View style={styles.categoriesContainer}>
                            <Animated.View style={[styles.skeletonCategory, { opacity }]} />
                            <Animated.View style={[styles.skeletonCategory, { opacity }]} />
                            <Animated.View style={[styles.skeletonCategory, { opacity }]} />
                        </View>
                    </View>
                    
                    {/* Arrow Skeleton */}
                    <Animated.View style={[styles.skeletonArrow, { opacity }]} />
                </View>
            </View>
        );
    };

    const renderReaderCard = (reader: TarotReaderResponse) => {
        const ratingDisplay = reader.ratingCount > 0 
            ? `${reader.ratingScore.toFixed(1)} ⭐ (${reader.ratingCount})`
            : 'Henüz değerlendirilmemiş';
        
        // Get avatar URL (check multiple possible property names)
        const avatarUrl = reader.avatar || reader.imageUrl || reader.image || reader.Image;

        return (
            <TouchableOpacity
                key={reader.id}
                style={styles.readerCard}
                onPress={() => handleReaderPress(reader)}
                activeOpacity={0.7}>
                <View style={styles.readerCardContent}>
                    {/* Left: Avatar with Rating below */}
                    <View style={styles.avatarSection}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarPlaceholderText}>
                                    {reader.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View style={styles.ratingContainer}>
                            <Text style={styles.readerRating}>{ratingDisplay}</Text>
                        </View>
                    </View>
                    
                    {/* Center: Name with Categories below */}
                    <View style={styles.readerInfo}>
                        <Text style={styles.readerName}>{reader.name}</Text>
                        {reader.categories && reader.categories.length > 0 && (
                            <View style={styles.categoriesContainer}>
                                {reader.categories.map((category, index) => (
                                    <View key={index} style={styles.categoryIconContainer}>
                                        <Text style={styles.categoryIcon}>
                                            {CATEGORY_ICONS[category]}
                                        </Text>
                                        <Text style={styles.categoryLabel}>
                                            {CATEGORY_LABELS[category]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                    
                    {/* Right: Arrow */}
                    <Text style={styles.arrowText}>→</Text>
                </View>
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

                {/* Subtitle */}
                <View style={styles.subtitleContainer}>
                    <Text style={styles.subtitle}>
                        Falcınızı seçin ve kartlarınızı açın
                    </Text>
                </View>

                {/* Geçmiş Tarot Fallarım Button */}
                <View style={styles.historyButtonContainer}>
                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigation.navigate('TarotHistory')}
                        activeOpacity={0.7}>
                        <View style={styles.historyButtonContent}>
                            <Text style={styles.historyButtonIcon}>✨</Text>
                            <Text style={styles.historyButtonText}>Geçmiş Tarot Fallarım</Text>
                            <Text style={styles.historyButtonArrow}>→</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Loading Skeleton */}
                {loading ? (
                    <View style={styles.readersList}>
                        {[1, 2, 3].map((index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </View>
                ) : readers.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Şu anda aktif falcı bulunmuyor
                        </Text>
                    </View>
                ) : (
                    <View style={styles.readersList}>
                        {readers.map(reader => renderReaderCard(reader))}
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
        marginBottom: 20,
        alignItems: 'center',
    },
    historyButtonContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    historyButton: {
        backgroundColor: '#27192c',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: COLORS.MAIN,
        shadowColor: COLORS.MAIN,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    historyButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    historyButtonIcon: {
        fontSize: 18,
    },
    historyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.MAIN,
    },
    historyButtonArrow: {
        fontSize: 18,
        color: COLORS.MAIN,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.SECOND,
        textAlign: 'center',
        opacity: 0.9,
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
    readersList: {
        gap: 16,
    },
    readerCard: {
        backgroundColor: '#27192c',
        borderRadius: 20,
        padding: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.1)',
    },
    readerCardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    avatarSection: {
        alignItems: 'center',
        width: 80,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: COLORS.MAIN,
        backgroundColor: '#1a0f1f',
        marginBottom: 8,
    },
    avatarPlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.MAIN,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.MAIN,
        marginBottom: 8,
    },
    avatarPlaceholderText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.BACKGROUND,
    },
    readerInfo: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    readerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 10,
    },
    ratingContainer: {
        alignItems: 'center',
        marginTop: 4,
    },
    readerRating: {
        fontSize: 12,
        color: COLORS.MAIN,
        fontWeight: '600',
        textAlign: 'center',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
    },
    categoryIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(224, 195, 108, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.3)',
        gap: 5,
    },
    categoryIcon: {
        fontSize: 14,
    },
    categoryLabel: {
        fontSize: 11,
        color: COLORS.MAIN,
        fontWeight: '600',
    },
    arrowText: {
        fontSize: 24,
        color: COLORS.MAIN,
        marginTop: 4,
    },
    // Skeleton Styles
    skeletonAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        marginBottom: 8,
    },
    skeletonRating: {
        width: 60,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        marginTop: 4,
    },
    skeletonName: {
        width: 150,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        marginBottom: 10,
    },
    skeletonCategory: {
        width: 70,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        marginRight: 8,
    },
    skeletonArrow: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        marginTop: 4,
    },
});

export default TarotReaderListScreen;

