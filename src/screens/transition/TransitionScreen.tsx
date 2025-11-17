// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { Text } from '../../components';
import { COLORS, TRANSITION_MESSAGES } from '../../utils/constants';
import useAuthStore from '../../store/authStore';

// Star Component
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
                    duration: 1000 + Math.random() * 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(starAnim, {
                    toValue: 0,
                    duration: 1000 + Math.random() * 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start(() => animate());
        };
        animate();
    }, []);

    const opacity = starAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 1],
    });

    const translateY = starAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    return (
        <Animated.View
            style={[
                styles.star,
                {
                    left: `${position.left}%`,
                    top: `${position.top}%`,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}>
            <Text style={styles.starText}>✨</Text>
        </Animated.View>
    );
};

const TransitionScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const { completeOnboarding } = useAuthStore();

    useEffect(() => {
        // Start progress animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: TRANSITION_MESSAGES.length * 2000,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();

        // Cycle through messages
        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                const next = prev + 1;
                if (next >= TRANSITION_MESSAGES.length) {
                    clearInterval(interval);
                    // Navigate to home after all messages
                    setTimeout(() => {
                        // Complete onboarding to switch AppNavigator stack
                        completeOnboarding();
                        
                        // Reset navigation stack and navigate to MainTabs
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'MainTabs' }],
                            })
                        );
                    }, 2000);
                    return prev;
                }
                return next;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fade in/out animation for each message
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        // Fade out before next message
        const fadeOutTimer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 400,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }, 1600);

        return () => clearTimeout(fadeOutTimer);
    }, [currentIndex]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Animated Stars Background */}
                <View style={styles.starsContainer}>
                    {[...Array(20)].map((_, i) => (
                        <AnimatedStar key={i} delay={i * 200} index={i} />
                    ))}
                </View>

                {/* Main Message */}
                <Animated.View
                    style={[
                        styles.messageContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}>
                    <Text style={styles.message}>
                        {TRANSITION_MESSAGES[currentIndex]}
                    </Text>
                </Animated.View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: progressWidth,
                                },
                            ]}
                        />
                    </View>
                </View>
            </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    starsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    star: {
        position: 'absolute',
    },
    starText: {
        fontSize: 20,
    },
    messageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    message: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.SECOND,
        textAlign: 'center',
        lineHeight: 32,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 60,
        left: 24,
        right: 24,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.MAIN,
        borderRadius: 2,
    },
});

export default TransitionScreen;

