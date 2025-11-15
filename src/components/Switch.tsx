// @ts-nocheck
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './Text';

const Switch = ({ value, onValueChange, label, disabled = false, style }) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                style={[
                    styles.switch,
                    value && styles.switchActive,
                    disabled && styles.switchDisabled,
                ]}
                onPress={() => !disabled && onValueChange(!value)}
                disabled={disabled}
                activeOpacity={0.7}>
                <View
                    style={[
                        styles.switchThumb,
                        value && styles.switchThumbActive,
                    ]}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 16,
        color: '#000',
        flex: 1,
    },
    switch: {
        width: 51,
        height: 31,
        borderRadius: 15.5,
        backgroundColor: '#E5E5EA',
        padding: 2,
        justifyContent: 'center',
    },
    switchActive: {
        backgroundColor: '#34C759',
    },
    switchDisabled: {
        opacity: 0.5,
    },
    switchThumb: {
        width: 27,
        height: 27,
        borderRadius: 13.5,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    switchThumbActive: {
        transform: [{ translateX: 20 }],
    },
});

export default Switch;

