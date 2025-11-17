import React, { useEffect, useRef } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Animated, View, StyleSheet } from 'react-native';
import useAuthStore from '../store/authStore';
import { Loading } from '../components';
import { COLORS } from '../utils/constants';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import LoginWithEmailScreen from '../screens/auth/LoginWithEmailScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Onboarding Screens
import OnboardingStep1 from '../screens/onboarding/OnboardingStep1';
import OnboardingStep2 from '../screens/onboarding/OnboardingStep2';
import OnboardingStep3 from '../screens/onboarding/OnboardingStep3';
import OnboardingStep4 from '../screens/onboarding/OnboardingStep4';

// Transition Screen
import TransitionScreen from '../screens/transition/TransitionScreen';

// App Screens
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, isLoading, initAuth, shouldShowOnboarding } = useAuthStore();
    const [isInitialized, setIsInitialized] = React.useState(false);
    const [showSplash, setShowSplash] = React.useState(true);
    const navOpacity = useRef(new Animated.Value(0)).current;

    // Initialize auth on app start with minimum splash screen duration
    useEffect(() => {
        const initialize = async () => {
            const startTime = Date.now();
            const minSplashDuration = 1100; // Minimum 1.1 seconds
            
            // Initialize auth
            await initAuth();
            
            // Ensure minimum splash screen duration
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minSplashDuration - elapsedTime);
            
            await new Promise<void>(resolve => setTimeout(() => resolve(), remainingTime));
            
            setIsInitialized(true);
            
            // Fade in navigation container
            Animated.timing(navOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
            
            // Fade out splash screen smoothly
            setTimeout(() => {
                setShowSplash(false);
            }, 400);
        };
        if (!isInitialized) {
            initialize();
        }
    }, [initAuth, isInitialized]);

    return (
        <View style={styles.container}>
            {/* Navigation Container - always rendered, hidden during splash */}
            <Animated.View style={[styles.navContainer, { opacity: isInitialized ? navOpacity : 0 }]}>
                <NavigationContainer
                    theme={{
                        dark: false,
                        colors: {
                            primary: COLORS.MAIN,
                            background: COLORS.BACKGROUND,
                            card: COLORS.BACKGROUND,
                            text: COLORS.SECOND,
                            border: COLORS.BACKGROUND,
                            notification: COLORS.MAIN,
                        },
                        fonts: {
                            regular: {
                                fontFamily: 'System',
                                fontWeight: 'normal' as const,
                            },
                            medium: {
                                fontFamily: 'System',
                                fontWeight: '500' as const,
                            },
                            bold: {
                                fontFamily: 'System',
                                fontWeight: 'bold' as const,
                            },
                            heavy: {
                                fontFamily: 'System',
                                fontWeight: '800' as const,
                            },
                        },
                    }}>
                    <Stack.Navigator
                        screenOptions={{
                            headerShown: false,
                            animation: 'none',
                        }}>
                        {isAuthenticated ? (
                            shouldShowOnboarding ? (
                                // Onboarding Stack (only after fresh login/register)
                                <>
                                    <Stack.Screen name="OnboardingStep1" component={OnboardingStep1} />
                                    <Stack.Screen name="OnboardingStep2" component={OnboardingStep2} />
                                    <Stack.Screen name="OnboardingStep3" component={OnboardingStep3} />
                                    <Stack.Screen name="OnboardingStep4" component={OnboardingStep4} />
                                    <Stack.Screen name="Transition" component={TransitionScreen} />
                                </>
                            ) : (
                                // Authenticated Stack - Tab Navigator (direct, no transition)
                                <>
                                    <Stack.Screen name="MainTabs" component={TabNavigator} />
                                </>
                            )
                        ) : (
                            // Auth Stack
                            <>
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="LoginWithEmail" component={LoginWithEmailScreen} />
                                <Stack.Screen name="Register" component={RegisterScreen} />
                            </>
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </Animated.View>
            
            {/* Splash Screen - on top */}
            {(showSplash || !isInitialized) && (
                <View style={styles.splashContainer}>
                    <Loading text="" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    splashContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    navContainer: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
});

export default AppNavigator;
