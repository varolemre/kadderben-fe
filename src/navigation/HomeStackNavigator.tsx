// @ts-nocheck
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import WheelScreen from '../screens/wheel/WheelScreen';

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'none',
            }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="Wheel" component={WheelScreen} />
        </Stack.Navigator>
    );
};

export default HomeStackNavigator;

