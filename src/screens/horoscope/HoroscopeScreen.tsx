// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text, ErrorPopup } from '../../components';
import { COLORS } from '../../utils/constants';
import * as horoscopeApi from '../../api/horoscopeApi';
import { DailyHoroscopeResponse, ZODIAC_ICONS } from '../../types/horoscope';

const HoroscopeScreen = () => {
    const insets = useSafeAreaInsets();
    const [horoscope, setHoroscope] = useState<DailyHoroscopeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadHoroscope();
        }, [])
    );

    const loadHoroscope = async () => {
        setLoading(true);
        setErrorMessage(null);
        setShowErrorPopup(false);

        try {
            const response = await horoscopeApi.getDailyHoroscope();
            if (response.success && response.data) {
                setHoroscope(response.data);
            } else {
                setErrorMessage(response.message || 'Burç yorumu yüklenirken bir hata oluştu');
                setShowErrorPopup(true);
            }
        } catch (err: any) {
            console.error('Error loading horoscope:', err);
            setErrorMessage('Burç yorumu yüklenirken bir hata oluştu');
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
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
            <View style={styles.skeletonContainer}>
                <Animated.View style={[styles.skeletonZodiacCard, { opacity }]} />
                <Animated.View style={[styles.skeletonContentCard, { opacity }]} />
            </View>
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
                    <Text style={styles.headerTitle}>Günlük Burç</Text>
                </View>

                {loading ? (
                    <SkeletonCard />
                ) : horoscope ? (
                    <View style={styles.contentContainer}>
                        {/* Zodiac Sign Card */}
                        <View style={styles.zodiacCard}>
                            <View style={styles.zodiacIconContainer}>
                                <Text style={styles.zodiacIcon}>
                                    {ZODIAC_ICONS[horoscope.zodiacSign] || '✨'}
                                </Text>
                            </View>
                            <Text style={styles.zodiacName}>{horoscope.zodiacSignDisplay}</Text>
                            <Text style={styles.zodiacDate}>{formatDate(horoscope.date)}</Text>
                        </View>

                        {/* Horoscope Content Card */}
                        <View style={styles.contentCard}>
                            <View style={styles.contentHeader}>
                                <Text style={styles.contentIcon}>✨</Text>
                                <Text style={styles.contentTitle}>Günlük Yorum</Text>
                            </View>
                            <Text style={styles.contentText}>{horoscope.comment}</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🌟</Text>
                        <Text style={styles.emptyText}>Burç yorumu yüklenemedi</Text>
                    </View>
                )}
            </ScrollView>

            {/* Error Popup */}
            <ErrorPopup
                visible={showErrorPopup}
                title="Hata"
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
        padding: 24,
        paddingTop: 20,
        maxWidth: 430,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.SECOND,
    },
    contentContainer: {
        gap: 20,
    },
    zodiacCard: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.2)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    zodiacIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(224, 195, 108, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.MAIN,
    },
    zodiacIcon: {
        fontSize: 32,
    },
    zodiacName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.MAIN,
        marginBottom: 4,
    },
    zodiacDate: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.8,
    },
    contentCard: {
        backgroundColor: '#27192c',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.2)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    contentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    contentIcon: {
        fontSize: 24,
    },
    contentTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.MAIN,
    },
    contentText: {
        fontSize: 16,
        color: COLORS.SECOND,
        lineHeight: 26,
        textAlign: 'justify',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
    // Skeleton Styles
    skeletonContainer: {
        gap: 20,
    },
    skeletonZodiacCard: {
        height: 280,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        borderRadius: 24,
    },
    skeletonContentCard: {
        height: 200,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        borderRadius: 20,
    },
});

export default HoroscopeScreen;
