// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { Text, Button } from './';
import { COLORS } from '../utils/constants';

interface ErrorPopupProps {
    visible: boolean;
    title?: string;
    message: string;
    icon?: string;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({
    visible,
    title = 'Bir şeyler ters gitti',
    message,
    icon = '⚠️',
    primaryActionLabel = 'Tamam',
    onPrimaryAction,
    secondaryActionLabel,
    onSecondaryAction,
    onClose,
}) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Animate in
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 200,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handlePrimaryAction = () => {
        if (onPrimaryAction) {
            onPrimaryAction();
        } else {
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.popupContainer,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}>
                    {/* Icon Badge */}
                    <View style={styles.iconBadge}>
                        <Text style={styles.iconText}>{icon}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title={primaryActionLabel}
                            onPress={handlePrimaryAction}
                            style={[styles.primaryButton, { backgroundColor: COLORS.MAIN }]}
                        />
                        {secondaryActionLabel && onSecondaryAction && (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={onSecondaryAction}>
                                <Text style={styles.secondaryButtonText}>
                                    {secondaryActionLabel}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    popupContainer: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.3)',
    },
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: COLORS.MAIN,
    },
    iconText: {
        fontSize: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: COLORS.SECOND,
        opacity: 0.9,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        width: '100%',
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 14,
        color: COLORS.MAIN,
        fontWeight: '600',
    },
});

export default ErrorPopup;

