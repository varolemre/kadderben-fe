import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Animated } from 'react-native';
import Text from './Text';
import { COLORS } from '../utils/constants';

const Loading = ({ text = 'Loading...', size = 'large', color = COLORS.MAIN }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Fade in on mount
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Image
                source={require('../assets/welcomePicture.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <ActivityIndicator size={size} color={color} style={styles.spinner} />
            {text && text.trim() !== '' && <Text style={styles.text}>{text}</Text>}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND,
    },
    logo: {
        width: 200,
        height: 150,
        marginBottom: 20,
    },
    spinner: {
        marginTop: 20,
    },
    text: {
        marginTop: 12,
        fontSize: 16,
        color: COLORS.SECOND,
    },
});

export default Loading;
