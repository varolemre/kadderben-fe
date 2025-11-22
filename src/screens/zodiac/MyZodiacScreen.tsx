// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { Text } from '../../components';
import { COLORS } from '../../utils/constants';
import * as zodiacApi from '../../api/zodiacApi';
import { ZodiacResponse } from '../../types/zodiac';

const MyZodiacScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [zodiacData, setZodiacData] = useState<ZodiacResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            loadZodiacData();
        }, [])
    );

    useEffect(() => {
        loadZodiacData();
    }, []);

    const loadZodiacData = async () => {
        try {
            setLoading(true);
            const response = await zodiacApi.getMyZodiac();
            if (response.success && response.data) {
                setZodiacData(response.data);
            }
        } catch (err) {
            console.error('Error loading zodiac data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getZodiacEmoji = (zodiacSign: string) => {
        const emojiMap: { [key: string]: string } = {
            KOC: '♈',
            BOGA: '♉',
            IKIZLER: '♊',
            YENGEC: '♋',
            ASLAN: '♌',
            BASAK: '♍',
            TERAZI: '♎',
            AKREP: '♏',
            YAY: '♐',
            OGLAK: '♑',
            KOVA: '♒',
            BALIK: '♓',
        };
        return emojiMap[zodiacSign] || '✨';
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: 32 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Size Özel</Text>
                        <Text style={styles.headerIcon}>✨</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.MAIN} />
                        <Text style={styles.loadingText}>Yıldız haritanız hazırlanıyor...</Text>
                    </View>
                ) : zodiacData ? (
                    <View style={styles.zodiacCard}>
                        {/* Zodiac Sign Header */}
                        <View style={styles.zodiacSignContainer}>
                            <Text style={styles.zodiacSignEmoji}>
                                {getZodiacEmoji(zodiacData.zodiacSign)}
                            </Text>
                            <Text style={styles.zodiacSignName}>{zodiacData.name}</Text>
                        </View>

                        {/* Special Quote */}
                        {zodiacData.specialQuote && (
                            <View style={styles.quoteContainer}>
                                <Text style={styles.quoteIcon}>💫</Text>
                                <Text style={styles.quoteText}>{zodiacData.specialQuote}</Text>
                            </View>
                        )}

                        {/* Description (HTML) */}
                        {zodiacData.description && (
                            <View style={styles.descriptionContainer}>
                                <RenderHTML
                                    contentWidth={width - 96}
                                    source={{ html: zodiacData.description }}
                                    baseStyle={styles.htmlBase}
                                    tagsStyles={{
                                        p: { color: COLORS.SECOND, marginBottom: 16, lineHeight: 24 },
                                        strong: { color: COLORS.MAIN, fontWeight: 'bold' },
                                        em: { color: COLORS.SECOND, fontStyle: 'italic' },
                                        ul: { marginBottom: 16 },
                                        li: { color: COLORS.SECOND, marginBottom: 8, lineHeight: 22 },
                                        h1: { color: COLORS.MAIN, fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
                                        h2: { color: COLORS.MAIN, fontSize: 20, fontWeight: 'bold', marginBottom: 14 },
                                        h3: { color: COLORS.MAIN, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
                                        br: { marginBottom: 8 },
                                    }}
                                />
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Burç bilgisi yüklenemedi</Text>
                    </View>
                )}
            </ScrollView>
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
        maxWidth: 430,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.SECOND,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.MAIN,
    },
    headerIcon: {
        fontSize: 24,
    },
    loadingContainer: {
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.SECOND,
    },
    zodiacCard: {
        backgroundColor: '#27192c',
        borderRadius: 24,
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.3)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    zodiacSignContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 16,
    },
    zodiacSignEmoji: {
        fontSize: 48,
    },
    zodiacSignName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.MAIN,
    },
    quoteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(224, 195, 108, 0.15)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.MAIN,
    },
    quoteIcon: {
        fontSize: 24,
        marginRight: 12,
        marginTop: 2,
    },
    quoteText: {
        flex: 1,
        fontSize: 18,
        color: COLORS.SECOND,
        fontStyle: 'italic',
        lineHeight: 26,
    },
    descriptionContainer: {
        marginTop: 8,
    },
    htmlBase: {
        color: COLORS.SECOND,
        fontSize: 16,
        lineHeight: 24,
    },
    errorContainer: {
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.SECOND,
    },
});

export default MyZodiacScreen;

