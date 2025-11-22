// @ts-nocheck
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '../components';
import { COLORS } from '../utils/constants';

// Screens
import HomeStackNavigator from './HomeStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import HoroscopeScreen from '../screens/horoscope/HoroscopeScreen';
import RitualScreen from '../screens/ritual/RitualScreen';
import BlogScreen from '../screens/blog/BlogScreen';

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
                component={HomeStackNavigator}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Icon 
                            name={focused ? 'home' : 'home-outline'} 
                            size={28} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Horoscope"
                component={HoroscopeScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Icon 
                            name={focused ? 'moon' : 'moon-outline'} 
                            size={28} 
                            color={color} 
                        />
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
                                <Icon name="sparkles" size={28} color="#FFFFFF" />
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
                        <Icon 
                            name={focused ? 'book' : 'book-outline'} 
                            size={28} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Icon 
                            name={focused ? 'person' : 'person-outline'} 
                            size={28} 
                            color={color} 
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        paddingBottom: 20,
        paddingTop: 12,
        backgroundColor: COLORS.BACKGROUND,
        borderTopWidth: 0.5,
        borderTopColor: '#E5E5EA',
        position: 'absolute',
    },
    icon: {
        fontSize: 28,
    },
    centerButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
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
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerIcon: {
        fontSize: 28,
        color: '#FFFFFF',
    },
});

export default TabNavigator;

