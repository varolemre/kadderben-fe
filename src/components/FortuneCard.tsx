// @ts-nocheck
import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import Text from './Text';
import { COLORS } from '../utils/constants';

interface FortuneCardProps {
    imageSource: any;
    title: string;
    subtitle: string;
    onPress?: () => void;
    style?: any;
    compact?: boolean;
}

const FortuneCard = ({ imageSource, title, subtitle, onPress, style, compact = false }: FortuneCardProps) => {
    return (
        <TouchableOpacity
            style={[styles.card, compact && styles.compactCard, style]}
            onPress={onPress}
            activeOpacity={0.8}>
            <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
                <Image
                    source={imageSource}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, compact && styles.compactTitle]}>{title}</Text>
                <Text style={[styles.subtitle, compact && styles.compactSubtitle]} numberOfLines={2}>{subtitle}</Text>
            </View>
            {!compact && (
                <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>›</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#27192c', // Match card background to hide transparent areas
        marginRight: 16,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.SECOND,
        lineHeight: 20,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    arrow: {
        fontSize: 24,
        color: COLORS.MAIN,
        fontWeight: '300',
    },
    // Compact styles for side-by-side cards
    compactCard: {
        padding: 12,
        flexDirection: 'column',
        alignItems: 'center',
    },
    compactImageContainer: {
        width: 60,
        height: 60,
        marginRight: 0,
        marginBottom: 8,
    },
    compactTitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 2,
    },
    compactSubtitle: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default FortuneCard;

