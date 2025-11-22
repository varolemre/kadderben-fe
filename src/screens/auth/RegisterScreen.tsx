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
import { Button, Input, Text, Switch } from '../../components';
import { Text as RNText } from 'react-native';
import TermsModal from '../../components/TermsModal';
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
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
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
            newErrors.fullName = 'Ad soyad gereklidir';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Ad soyad en az 2 karakter olmalıdır';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-posta gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifre onayı gereklidir';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
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
                                <Text style={styles.title}>Hesap Oluştur</Text>
                                <Text style={styles.subtitle}>Başlamak için kayıt olun</Text>
                            </View>

                            <View style={styles.form}>
                                <Input
                                    label="Ad Soyad"
                                    value={formData.fullName}
                                    onChangeText={text => updateField('fullName', text)}
                                    placeholder="Adınızı ve soyadınızı girin"
                                    autoCapitalize="words"
                                    error={errors.fullName}
                                />

                                <Input
                                    label="E-posta"
                                    value={formData.email}
                                    onChangeText={text => updateField('email', text)}
                                    placeholder="E-posta adresinizi girin"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    error={errors.email}
                                    enableEmailSuggestions
                                />

                                <Input
                                    label="Şifre"
                                    value={formData.password}
                                    onChangeText={text => updateField('password', text)}
                                    placeholder="Şifre oluşturun"
                                    secureTextEntry
                                    showPasswordToggle
                                    error={errors.password}
                                />

                                <Input
                                    label="Şifre Onayı"
                                    value={formData.confirmPassword}
                                    onChangeText={text => updateField('confirmPassword', text)}
                                    placeholder="Şifrenizi onaylayın"
                                    secureTextEntry
                                    showPasswordToggle
                                    error={errors.confirmPassword}
                                />

                                {/* Terms and Privacy */}
                                <View style={styles.termsContainer}>
                                <View style={styles.termsRow}>
 
  
  <Text style={[styles.termsText, { flex: 1}]}>
  Kaydolarak{' '}
    <Text 
      style={styles.termsLink}
      onPress={() => setShowPrivacyModal(true)}
    >
      Gizlilik Politikası
    </Text>
    {' '}ve{' '}
    <Text 
      style={styles.termsLink}
      onPress={() => setShowTermsModal(true)}
    >
      Kullanım Koşulları
    </Text>
    {' '}metinlerini kabul etmiş olursunuz.
  </Text>
</View>

                                    {errors.terms && (
                                        <Text style={styles.errorText}>{errors.terms}</Text>
                                    )}
                                </View>

                                <Button
                                    title="Kayıt Ol"
                                    onPress={handleRegister}
                                    loading={isLoading}
                                    style={[styles.registerButton, { backgroundColor: COLORS.MAIN }]}
                                />

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text style={styles.linkText}>Giriş Yap</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Terms Modals */}
                <TermsModal
                    visible={showTermsModal}
                    type="terms"
                    onClose={() => setShowTermsModal(false)}
                />
                <TermsModal
                    visible={showPrivacyModal}
                    type="privacy"
                    onClose={() => setShowPrivacyModal(false)}
                />
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
    termsContainer: {
        marginTop: 16,
        marginBottom: 8,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      },
      termsText: {
        fontSize: 13,
        color: COLORS.SECOND,
        lineHeight: 20,
      },
      
    switch: {
        marginRight: 12,
    },
    termsText: {
        fontSize: 13,
        color: COLORS.SECOND,
        lineHeight: 20,
    },
    termsLink: {
        fontSize: 13,
        color: COLORS.MAIN,
        textDecorationLine: 'underline',
    },
    errorText: {
        fontSize: 12,
        color: '#FF6B6B',
        marginTop: 4,
        marginLeft: 44,
    },
});

export default RegisterScreen;
