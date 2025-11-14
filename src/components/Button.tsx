// @ts-nocheck
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

const Button = ({
                    title,
                    onPress,
                    loading = false,
                    disabled = false,
                    variant = 'primary', // primary, secondary, outline
                    style,
                    textStyle,
                }) => {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[variant],
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}>
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? '#007AFF' : '#FFFFFF'}
                />
            ) : (
                <Text style={[
                    styles.text,
                    variant === 'primary' && styles.primaryText,
                    variant === 'secondary' && styles.secondaryText,
                    variant === 'outline' && styles.outlineText,
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    primary: {
        backgroundColor: '#007AFF',
    },
    secondary: {
        backgroundColor: '#5856D6',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#007AFF',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#FFFFFF',
    },
    outlineText: {
        color: '#007AFF',
    },
});

export default Button;
