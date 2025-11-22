// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Image,
    Animated,
    Easing,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '../../components';
import TermsModal from '../../components/TermsModal';
import { COLORS } from '../../utils/constants';

const welcomeImage = require('../../assets/welcomePicture.png');

// Animated Star Component
const AnimatedStar = ({ delay, index }) => {
    const starAnim = useRef(new Animated.Value(0)).current;
    const [position] = useState({
        left: Math.random() * 100,
        top: Math.random() * 100,
    });

    useEffect(() => {
        const animate = () => {
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(starAnim, {
                    toValue: 1,
                    duration: 2000 + Math.random() * 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(starAnim, {
                    toValue: 0,
                    duration: 2000 + Math.random() * 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start(() => animate());
        };
        animate();
    }, []);

    const opacity = starAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.4],
    });

    const scale = starAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.2],
    });

    return (
        <Animated.View
            style={[
                styles.star,
                {
                    left: `${position.left}%`,
                    top: `${position.top}%`,
                    opacity,
                    transform: [{ scale }],
                },
            ]}>
            <Text style={styles.starText}>✨</Text>
        </Animated.View>
    );
};

// Floating Particle Component
const FloatingParticle = ({ delay, index }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0.15)).current;
    const [position] = useState({
        left: Math.random() * 100,
        top: Math.random() * 100,
    });

    useEffect(() => {
        const animate = () => {
            Animated.parallel([
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(translateY, {
                            toValue: -30,
                            duration: 8000 + Math.random() * 4000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateY, {
                            toValue: 0,
                            duration: 8000 + Math.random() * 4000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ])
                ),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(opacity, {
                            toValue: 0.3,
                            duration: 3000 + Math.random() * 2000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0.15,
                            duration: 3000 + Math.random() * 2000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ])
                ),
            ]).start();
        };
        animate();
    }, []);

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: `${position.left}%`,
                    top: `${position.top}%`,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        />
    );
};

const LoginScreen = ({ navigation }) => {
    const [showTermsModal, setShowTermsModal] = React.useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);
    const screenFade = useRef(new Animated.Value(0)).current;
    const titleFade = useRef(new Animated.Value(0)).current;
    const subtitleFade = useRef(new Animated.Value(0)).current;
    const imageGlow = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Screen fade-in
        Animated.timing(screenFade, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();

        // Title fade-in
        Animated.timing(titleFade, {
            toValue: 1,
            duration: 800,
            delay: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();

        // Subtitle fade-in
        Animated.timing(subtitleFade, {
            toValue: 1,
            duration: 800,
            delay: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();

        // Image glow pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(imageGlow, {
                    toValue: 0.6,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(imageGlow, {
                    toValue: 0.3,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    const glowOpacity = imageGlow.interpolate({
        inputRange: [0.3, 0.6],
        outputRange: [0.3, 0.5],
    });

    return (
        <Animated.View style={[styles.wrapper, { opacity: screenFade }]}>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
                {/* Background Stars */}
                <View style={styles.starsContainer}>
                {[...Array(15)].map((_, i) => (
                    <AnimatedStar key={i} delay={i * 300} index={i} />
                ))}
            </View>

            {/* Floating Particles */}
            <View style={styles.particlesContainer}>
                {[...Array(8)].map((_, i) => (
                    <FloatingParticle key={i} delay={i * 500} index={i} />
                ))}
            </View>

            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    {/* Glow Effect */}
                    <Animated.View
                        style={[
                            styles.imageGlow,
                            {
                                opacity: glowOpacity,
                            },
                        ]}
                    />
                    <Image 
                        source={welcomeImage} 
                        style={styles.welcomeImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.bottomSection}>
                    <View style={styles.header}>
                        <Animated.View style={{ opacity: titleFade }}>
                            <Text style={styles.title}>KadderBal'a Hoş Geldinizz</Text>
                        </Animated.View>
                        <Animated.View style={{ opacity: subtitleFade }}>
                            <Text style={styles.subtitle}>Devam etmek için bir yöntem seçin</Text>
                        </Animated.View>
                    </View>

                    <View style={styles.oauthContainer}>
                        <Button
                            title="Google ile Devam Et"
                            onPress={() => Alert.alert('Yakında', 'Google ile giriş yakında eklenecek')}
                            variant="outline"
                            style={styles.oauthButton}
                            textStyle={styles.oauthButtonText}
                            disabled
                        />

                        <Button
                            title="Apple ile Devam Et"
                            onPress={() => Alert.alert('Yakında', 'Apple ile giriş yakında eklenecek')}
                            variant="outline"
                            style={styles.oauthButton}
                            textStyle={styles.oauthButtonText}
                            disabled
                        />

                        <Button
                            title="E-posta ile Devam Et"
                            onPress={() => navigation.navigate('LoginWithEmail')}
                            variant="outline"
                            style={styles.oauthButton}
                            textStyle={styles.oauthButtonText}
                        />

                        {/* Terms Links */}
                        <View style={styles.termsLinks}>
                            <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                                <Text style={styles.termsLink}>Kullanıcı Sözleşmesi</Text>
                            </TouchableOpacity>
                            <Text style={styles.termsSeparator}> • </Text>
                            <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
                                <Text style={styles.termsLink}>Gizlilik Politikası</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {/* Terms Modals */}
            <TermsModal
                visible={showTermsModal}
                type="terms"
                onClose={() => setShowTermsModal(false)}
            />
            <TermsModal
                visible={showPrivacyModal}
                type="privacy"
                onClose={() => setShowPrivacyModal(false)}
            />
        </SafeAreaView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    starsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    star: {
        position: 'absolute',
    },
    starText: {
        fontSize: 16,
    },
    particlesContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    particle: {
        position: 'absolute',
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: COLORS.MAIN,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        zIndex: 1,
        justifyContent: 'space-between',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        position: 'relative',
        minHeight: 0,
    },
    imageGlow: {
        position: 'absolute',
        width: '90%',
        height: '90%',
        borderRadius: 200,
        backgroundColor: COLORS.MAIN,
        shadowColor: COLORS.MAIN,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.8,
        shadowRadius: 40,
        elevation: 20,
    },
    welcomeImage: {
        width: '100%',
        height: '100%',
        maxHeight: 350,
        maxWidth: '100%',
        zIndex: 1,
    },
    bottomSection: {
        paddingBottom: 20,
        flexShrink: 0,
    },
    header: {
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'left',
    },
    oauthContainer: {
        marginTop: 16,
        flexShrink: 0,
    },
    oauthButton: {
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: COLORS.MAIN,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    oauthButtonText: {
        color: '#FFFFFF',
    },
    termsLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    termsLink: {
        fontSize: 12,
        color: COLORS.MAIN,
        textDecorationLine: 'underline',
    },
    termsSeparator: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.6,
    },
});

export default LoginScreen;
