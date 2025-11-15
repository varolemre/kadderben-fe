// @ts-nocheck
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Text } from '../../components';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

const LoginWithEmailScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const { login, isLoading } = useAuthStore();

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'E-posta gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Geçersiz e-posta adresi';
        }

        if (!password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        const result = await login(email.trim(), password);

        if (!result.success) {
            Alert.alert('Giriş Başarısız', result.error || 'Bir hata oluştu');
        }
        // If success, navigation will be handled automatically by App.js
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled">

                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>E-posta ile Giriş</Text>
                        <Text style={styles.subtitle}>Devam etmek için giriş yapın</Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="E-posta"
                            value={email}
                            onChangeText={text => {
                                setEmail(text);
                                setErrors(prev => ({ ...prev, email: '' }));
                            }}
                            placeholder="E-posta adresinizi girin"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                            enableEmailSuggestions
                            style={styles.input}
                        />

                        <Input
                            label="Şifre"
                            value={password}
                            onChangeText={text => {
                                setPassword(text);
                                setErrors(prev => ({ ...prev, password: '' }));
                            }}
                            placeholder="Şifrenizi girin"
                            secureTextEntry
                            showPasswordToggle
                            error={errors.password}
                            style={styles.input}
                        />

                        <Button
                            title="Giriş Yap"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={[styles.loginButton, { backgroundColor: COLORS.MAIN }]}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Hesabınız yok mu? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.linkText}>Kayıt Ol</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        marginBottom: 32,
    },
    loginButton: {
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
    input: {
        marginBottom: 8,
        color: COLORS.SECOND,
        textColor: COLORS.SECOND,
    },
});

export default LoginWithEmailScreen;

