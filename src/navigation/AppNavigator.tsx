import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useAuthStore from '../store/authStore';
import { Loading } from '../components';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import LoginWithEmailScreen from '../screens/auth/LoginWithEmailScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Onboarding Screens
import OnboardingStep1 from '../screens/onboarding/OnboardingStep1';
import OnboardingStep2 from '../screens/onboarding/OnboardingStep2';
import OnboardingStep3 from '../screens/onboarding/OnboardingStep3';
import OnboardingStep4 from '../screens/onboarding/OnboardingStep4';

// App Screens
import HomeScreen from '../screens/home/HomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, isLoading, initAuth, shouldShowOnboarding } = useAuthStore();
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Initialize auth on app start
    useEffect(() => {
        const initialize = async () => {
            await initAuth();
            setIsInitialized(true);
        };
        if (!isInitialized) {
            initialize();
        }
    }, [initAuth, isInitialized]);

    // Show loading only on initial load, not during login attempts
    if (!isInitialized) {
        return <Loading text="Loading..." />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}>
                {isAuthenticated ? (
                    shouldShowOnboarding ? (
                        // Onboarding Stack (only after fresh login/register)
                        <>
                            <Stack.Screen name="OnboardingStep1" component={OnboardingStep1} />
                            <Stack.Screen name="OnboardingStep2" component={OnboardingStep2} />
                            <Stack.Screen name="OnboardingStep3" component={OnboardingStep3} />
                            <Stack.Screen name="OnboardingStep4" component={OnboardingStep4} />
                        </>
                    ) : (
                        // Authenticated Stack
                        <>
                            <Stack.Screen name="Home" component={HomeScreen} />
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
    );
};

export default AppNavigator;
