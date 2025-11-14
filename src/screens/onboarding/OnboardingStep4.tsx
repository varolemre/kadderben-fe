// @ts-nocheck
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Switch } from '../../components';
import useOnboardingStore from '../../store/onboardingStore';
import useAuthStore from '../../store/authStore';
import * as onboardingApi from '../../api/onboardingApi';

const OnboardingStep4 = ({ navigation }) => {
    const { formData, updateField, resetForm } = useOnboardingStore();
    const { completeOnboarding, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            // Prepare data for API
            const onboardingData = {
                gender: formData.gender,
                birthDate: formData.birthDate,
                birthTime: formData.birthTime || null,
                birthCountry: formData.birthCountry,
                birthCity: formData.birthCity,
                occupation: formData.occupation || null,
                relationshipStatus: formData.relationshipStatus || null,
                notificationsEnabled: formData.notificationsEnabled,
            };

            const response = await onboardingApi.saveOnboarding(onboardingData);

            // Update user in store
            if (response.data?.user) {
                await updateUser(response.data.user);
            }

            // Complete onboarding
            completeOnboarding();
            resetForm();

            // Navigation will be handled automatically by AppNavigator
        } catch (error) {
            console.error('Onboarding save error:', error);
            Alert.alert(
                'Hata',
                error.message || 'Onboarding kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <Text style={styles.title}>Hoş Geldiniz! 🎉</Text>
                        <Text style={styles.subtitle}>
                            Profiliniz hazır. Bildirimleri etkinleştirerek güncel kalabilirsiniz.
                        </Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.switchContainer}>
                            <Switch
                                label="Bildirimleri Etkinleştir"
                                value={formData.notificationsEnabled}
                                onValueChange={(value) => updateField('notificationsEnabled', value)}
                            />
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Button
                            title="Geri"
                            onPress={handleBack}
                            variant="outline"
                            style={styles.backButton}
                            disabled={isLoading}
                        />
                        <Button
                            title="Haydi Başlayalım"
                            onPress={handleComplete}
                            loading={isLoading}
                            style={styles.completeButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginTop: 20,
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    switchContainer: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
    },
    footer: {
        marginTop: 24,
        flexDirection: 'row',
        gap: 12,
    },
    backButton: {
        flex: 1,
    },
    completeButton: {
        flex: 2,
    },
});

export default OnboardingStep4;

