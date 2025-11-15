// @ts-nocheck
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../components';
import { COLORS } from '../utils/constants';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import HoroscopeScreen from '../screens/horoscope/HoroscopeScreen';
import RitualScreen from '../screens/ritual/RitualScreen';
import BlogScreen from '../screens/blog/BlogScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.MAIN,
                tabBarInactiveTintColor: COLORS.SECOND,
                tabBarShowLabel: false,
            }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.icon, { color }]}>🏠</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Horoscope"
                component={HoroscopeScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.icon, { color }]}>🌟</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Ritual"
                component={RitualScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={styles.centerButton}>
                            <View style={[styles.centerButtonInner, { backgroundColor: COLORS.MAIN }]}>
                                <Text style={styles.centerIcon}>⭐</Text>
                            </View>
                        </View>
                    ),
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            {...props}
                            style={[props.style, styles.centerButtonContainer]}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Blog"
                component={BlogScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.icon, { color }]}>📰</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.icon, { color }]}>👤</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        paddingBottom: 25,
        paddingTop: 10,
        backgroundColor: COLORS.BACKGROUND,
        borderTopWidth: 0.5,
        borderTopColor: '#E5E5EA',
        position: 'absolute',
    },
    icon: {
        fontSize: 24,
    },
    centerButtonContainer: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.BACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    centerButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerIcon: {
        fontSize: 28,
        color: '#FFFFFF',
    },
});

export default TabNavigator;

