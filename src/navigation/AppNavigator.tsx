import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useAuthStore from '../store/authStore';
import { Loading } from '../components';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// App Screens
import HomeScreen from '../screens/home/HomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, isLoading, initAuth } = useAuthStore();

    // Initialize auth on app start
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    // Show loading while checking auth state
    if (isLoading) {
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
                    // Authenticated Stack
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                    </>
                ) : (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
