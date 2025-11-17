// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Text } from '../../components';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
    });
    const [errors, setErrors] = useState({});
    const screenFade = useRef(new Animated.Value(0)).current;
    const contentSlide = useRef(new Animated.Value(20)).current;

    const { register, isLoading } = useAuthStore();

    useEffect(() => {
        // Smooth fade-in and slide-up animation
        Animated.parallel([
            Animated.timing(screenFade, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(contentSlide, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        const result = await register({
            email: formData.email.trim(),
            password: formData.password,
            fullName: formData.fullName.trim(),
        });

        if (!result.success) {
            Alert.alert('Registration Failed', result.error || 'Something went wrong');
        }
        // If success, navigation will be handled automatically by App.js
    };

    return (
        <Animated.View style={[styles.wrapper, { opacity: screenFade }]}>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bounces={false}>

                        <Animated.View 
                            style={[
                                styles.animatedContent,
                                {
                                    opacity: screenFade,
                                    transform: [{ translateY: contentSlide }],
                                },
                            ]}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}>
                                <Text style={styles.backButtonText}>←</Text>
                            </TouchableOpacity>

                            <View style={styles.header}>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>Sign up to get started</Text>
                            </View>

                            <View style={styles.form}>
                                <Input
                                    label="Full Name"
                                    value={formData.fullName}
                                    onChangeText={text => updateField('fullName', text)}
                                    placeholder="Enter your full name"
                                    autoCapitalize="words"
                                    error={errors.fullName}
                                />

                                <Input
                                    label="Email"
                                    value={formData.email}
                                    onChangeText={text => updateField('email', text)}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    error={errors.email}
                                    enableEmailSuggestions
                                />

                                <Input
                                    label="Password"
                                    value={formData.password}
                                    onChangeText={text => updateField('password', text)}
                                    placeholder="Create a password"
                                    secureTextEntry
                                    showPasswordToggle
                                    error={errors.password}
                                />

                                <Input
                                    label="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChangeText={text => updateField('confirmPassword', text)}
                                    placeholder="Confirm your password"
                                    secureTextEntry
                                    showPasswordToggle
                                    error={errors.confirmPassword}
                                />

                                <Button
                                    title="Sign Up"
                                    onPress={handleRegister}
                                    loading={isLoading}
                                    style={[styles.registerButton, { backgroundColor: COLORS.MAIN }]}
                                />

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text style={styles.linkText}>Sign In</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingBottom: 100,
    },
    animatedContent: {
        flex: 1,
    },
    header: {
        marginTop: 40,
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.SECOND,
    },
    form: {
        marginBottom: 40,
    },
    registerButton: {
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: COLORS.SECOND,

    },
    linkText: {
        fontSize: 14,
        color: COLORS.MAIN,
        fontWeight: '600',
    },
    backButton: {
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default RegisterScreen;
