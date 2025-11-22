// @ts-nocheck
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import WheelScreen from '../screens/wheel/WheelScreen';
import CoffeeFortuneScreen from '../screens/coffeeFortune/CoffeeFortuneScreen';
import CoffeeFortuneHistoryScreen from '../screens/coffeeFortune/CoffeeFortuneHistoryScreen';
import TarotReaderListScreen from '../screens/tarot/TarotReaderListScreen';
import TarotReadingScreen from '../screens/tarot/TarotReadingScreen';
import TarotReadingHistoryScreen from '../screens/tarot/TarotReadingHistoryScreen';
import TarotReadingDetailScreen from '../screens/tarot/TarotReadingDetailScreen';
import LuckyCookieScreen from '../screens/fortune/LuckyCookieScreen';
import BurnThoughtScreen from '../screens/ritual/BurnThoughtScreen';
import MyZodiacScreen from '../screens/zodiac/MyZodiacScreen';

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
            <Stack.Screen name="CoffeeFortune" component={CoffeeFortuneScreen} />
            <Stack.Screen name="CoffeeFortuneHistory" component={CoffeeFortuneHistoryScreen} />
            <Stack.Screen name="TarotReaderList" component={TarotReaderListScreen} />
            <Stack.Screen name="TarotReading" component={TarotReadingScreen} />
            <Stack.Screen name="TarotHistory" component={TarotReadingHistoryScreen} />
            <Stack.Screen name="TarotReadingDetail" component={TarotReadingDetailScreen} />
            <Stack.Screen name="LuckyCookie" component={LuckyCookieScreen} />
            <Stack.Screen name="BurnThought" component={BurnThoughtScreen} />
            <Stack.Screen name="MyZodiac" component={MyZodiacScreen} />
        </Stack.Navigator>
    );
};

export default HomeStackNavigator;

