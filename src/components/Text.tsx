// @ts-nocheck
import React from 'react';
import { Text as RNText, TextProps, StyleSheet, Platform } from 'react-native';
import { FONTS } from '../utils/constants';

const Text = ({ style, ...props }: TextProps) => {
    return (
        <RNText
            style={[styles.defaultText, style]}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    defaultText: {
        fontFamily: Platform.select({
            ios: 'RedHatDisplay-Regular', // iOS'ta tam font adı
            android: FONTS.REGULAR,
            default: FONTS.REGULAR,
        }),
    },
});

export default Text;

