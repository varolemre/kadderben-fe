// @ts-nocheck
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components';
import { COLORS } from '../../utils/constants';

const BlogScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Blog</Text>
                <Text style={styles.subtitle}>Blog sayfası yakında eklenecek</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.SECOND,
    },
});

export default BlogScreen;

