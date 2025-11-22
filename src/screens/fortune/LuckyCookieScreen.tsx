// @ts-nocheck
import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { Text, Button, ErrorPopup } from '../../components';
import { COLORS } from '../../utils/constants';
import * as cookieFortuneApi from '../../api/cookieFortuneApi';
import { CookieFortuneResponse } from '../../types/cookieFortune';

const LuckyCookieScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const animationRef = useRef<LottieView>(null);
    const messageFadeAnim = useRef(new Animated.Value(0)).current;

    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [nextCookieAvailable, setNextCookieAvailable] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [hasOpenedToday, setHasOpenedToday] = useState(false);

    // Reset animation when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            // Reset animation to beginning when screen is focused
            // This ensures the cookie is visible when returning to the screen
            const timer = setTimeout(() => {
                animationRef.current?.reset();
            }, 100);
            
            return () => {
                clearTimeout(timer);
            };
        }, [])
    );

    const handleOpenCookie = async () => {
        if (loading || animating) return;

        setLoading(true);
        setError(null);
        setShowErrorPopup(false);
        setMessage(null);
        setShowMessage(false);

        try {
            const response = await cookieFortuneApi.openCookie();
            
            if (response.success && response.data) {
                const data: CookieFortuneResponse = response.data;
                
                // Set message and next available time
                setMessage(data.message);
                setNextCookieAvailable(new Date(data.nextCookieAvailable));
                
                // Start animation
                setLoading(false);
                setAnimating(true);
                
                // Play Lottie animation
                animationRef.current?.play();
            } else {
                // Handle error (e.g., already opened today)
                setError(response.message || 'Kurabiye açılırken bir hata oluştu');
                setShowErrorPopup(true);
                setLoading(false);
                
                // Check if error indicates already opened today
                if (response.message?.toLowerCase().includes('bugün') || 
                    response.message?.toLowerCase().includes('yarın')) {
                    setHasOpenedToday(true);
                }
            }
        } catch (err: any) {
            console.error('Error opening cookie:', err);
            setError('Kurabiye açılırken bir hata oluştu');
            setShowErrorPopup(true);
            setLoading(false);
        }
    };

    const handleAnimationFinish = () => {
        setAnimating(false);
        
        // Show message with fade-in animation
        setShowMessage(true);
        Animated.timing(messageFadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const formatNextCookieDate = (date: Date) => {
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getButtonText = () => {
        if (loading) return 'Yükleniyor...';
        if (animating) return 'Kurabiye Açılıyor...';
        if (hasOpenedToday) return 'Bugünkü Kurabiyeni Açtın';
        return 'Falını Gör';
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
                    <Text style={styles.headerTitle}>Şans Kurabiyesi</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Description */}
                <Text style={styles.description}>
                    Bugünün şanslı mesajı için kurabiyeni kır.
                </Text>

                {/* Cookie Animation Area and Message Card Container */}
                <View style={styles.cookieAndMessageContainer}>
                    <View style={styles.cookieContainer}>
                        <LottieView
                            ref={animationRef}
                            source={require('../../assets/lottie/kurabiye.json')}
                            autoPlay={false}
                            loop={false}
                            style={styles.lottie}
                            onAnimationFinish={handleAnimationFinish}
                        />
                    </View>

                    {/* Message Card - Positioned absolutely over cookie area */}
                    {showMessage && message && (
                        <Animated.View
                            style={[
                                styles.messageCard,
                                { opacity: messageFadeAnim },
                            ]}>
                            <Text style={styles.messageTitle}>Bugünkü Mesajın</Text>
                            <Text style={styles.messageText}>{message}</Text>
                        </Animated.View>
                    )}
                </View>

                {/* Next Cookie Available Info */}
                {nextCookieAvailable && !hasOpenedToday && (
                    <View style={styles.nextCookieInfo}>
                        <Text style={styles.nextCookieText}>
                            Bir sonraki şans kurabiyen: {formatNextCookieDate(nextCookieAvailable)}
                        </Text>
                    </View>
                )}

                {/* Already Opened Today Message */}
                {hasOpenedToday && (
                    <View style={styles.alreadyOpenedContainer}>
                        <Text style={styles.alreadyOpenedText}>
                            Bugünkü kurabiyeni çoktan açtın. Yarın tekrar gel.
                        </Text>
                        {nextCookieAvailable && (
                            <Text style={styles.nextCookieText}>
                                Bir sonraki şans kurabiyen: {formatNextCookieDate(nextCookieAvailable)}
                            </Text>
                        )}
                    </View>
                )}

                {/* Open Cookie Button */}
                <View style={styles.buttonContainer}>
                    <Button
                        title={getButtonText()}
                        onPress={handleOpenCookie}
                        disabled={loading || animating || hasOpenedToday}
                        style={[styles.openButton, { backgroundColor: COLORS.MAIN }]}
                    />
                </View>
            </ScrollView>

            {/* Error Popup */}
            <ErrorPopup
                visible={showErrorPopup}
                title="Hata"
                message={error || ''}
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
    description: {
        fontSize: 16,
        color: COLORS.SECOND,
        textAlign: 'center',
        marginBottom: 32,
        opacity: 0.9,
    },
    cookieAndMessageContainer: {
        width: '100%',
        marginBottom: 24,
        position: 'relative',
    },
    cookieContainer: {
        width: '100%',
        height: 260,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    messageCard: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        backgroundColor: '#F8F4EC',
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: COLORS.MAIN,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 10,
    },
    messageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.BACKGROUND,
        marginBottom: 16,
        textAlign: 'center',
    },
    messageText: {
        fontSize: 18,
        color: '#2C1810',
        lineHeight: 28,
        textAlign: 'center',
        fontWeight: '500',
    },
    nextCookieInfo: {
        backgroundColor: 'rgba(224, 195, 108, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.2)',
    },
    nextCookieText: {
        fontSize: 14,
        color: COLORS.MAIN,
        textAlign: 'center',
        fontWeight: '600',
    },
    alreadyOpenedContainer: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.2)',
    },
    alreadyOpenedText: {
        fontSize: 14,
        color: '#FF6B6B',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    buttonContainer: {
        marginTop: 8,
        marginBottom: 20,
    },
    openButton: {
        width: '100%',
    },
});

export default LuckyCookieScreen;

