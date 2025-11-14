// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Dropdown } from '../../components';
import useOnboardingStore from '../../store/onboardingStore';
import {
    COUNTRY_OPTIONS,
    CITY_OPTIONS,
    OCCUPATION_OPTIONS,
} from '../../utils/onboardingData';

const OnboardingStep2 = ({ navigation }) => {
    const { formData, updateField } = useOnboardingStore();

    const isFormValid =
        formData.birthCountry !== null &&
        formData.birthCity !== null;

    const handleNext = () => {
        if (isFormValid) {
            navigation.navigate('OnboardingStep3');
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
                        <Text style={styles.title}>Konum ve Meslek</Text>
                        <Text style={styles.subtitle}>Doğum yeriniz ve mesleğiniz hakkında bilgi verin</Text>
                    </View>

                    <View style={styles.form}>
                        <Dropdown
                            label="Ülke"
                            value={formData.birthCountry}
                            onSelect={(value) => updateField('birthCountry', value)}
                            options={COUNTRY_OPTIONS}
                            placeholder="Ülkenizi seçin"
                            required
                        />

                        <Dropdown
                            label="Şehir"
                            value={formData.birthCity}
                            onSelect={(value) => updateField('birthCity', value)}
                            options={CITY_OPTIONS}
                            placeholder="Şehrinizi seçin"
                            required
                        />

                        <Dropdown
                            label="Meslek"
                            value={formData.occupation}
                            onSelect={(value) => updateField('occupation', value)}
                            options={OCCUPATION_OPTIONS}
                            placeholder="Mesleğinizi seçin (opsiyonel)"
                        />
                    </View>

                    <View style={styles.footer}>
                        <Button
                            title="Geri"
                            onPress={handleBack}
                            variant="outline"
                            style={styles.backButton}
                        />
                        <Button
                            title="Devam Et"
                            onPress={handleNext}
                            disabled={!isFormValid}
                            style={styles.nextButton}
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        flex: 1,
    },
    footer: {
        marginTop: 24,
        flexDirection: 'row',
        gap: 12,
    },
    backButton: {
        flex: 1,
    },
    nextButton: {
        flex: 1,
    },
});

export default OnboardingStep2;
