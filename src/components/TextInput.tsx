// @ts-nocheck
import React from 'react';
import { TextInput as RNTextInput, TextInputProps, StyleSheet, Platform } from 'react-native';
import { FONTS } from '../utils/constants';

const TextInput = ({ style, ...props }: TextInputProps) => {
    return (
        <RNTextInput
            style={[styles.defaultTextInput, style]}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    defaultTextInput: {
        fontFamily: Platform.select({
            ios: 'RedHatDisplay-Regular', // iOS'ta tam font adı
            android: FONTS.REGULAR,
            default: FONTS.REGULAR,
        }),
    },
});

export default TextInput;

