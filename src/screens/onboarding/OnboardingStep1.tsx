// @ts-nocheck
import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Dropdown, Text } from '../../components';
import useOnboardingStore from '../../store/onboardingStore';
import { GENDER_OPTIONS, RELATIONSHIP_STATUS_OPTIONS } from '../../utils/onboardingData';
import { COLORS } from '../../utils/constants';

const OnboardingStep1 = ({ navigation }) => {
    const { formData, updateField } = useOnboardingStore();

    const isFormValid = formData.gender !== null;

    const handleNext = () => {
        if (isFormValid) {
            navigation.navigate('OnboardingStep2');
        }
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
                        <Text style={styles.title}>Kişisel Bilgiler</Text>
                        <Text style={styles.subtitle}>Cinsiyetinizi ve ilişki durumunuzu seçin</Text>
                    </View>

                    <View style={styles.form}>
                        <Dropdown
                            label="Cinsiyet"
                            value={formData.gender}
                            onSelect={(value) => updateField('gender', value)}
                            options={GENDER_OPTIONS}
                            placeholder="Cinsiyetinizi seçin"
                            required
                        />

                        <Dropdown
                            label="İlişki Durumu"
                            value={formData.relationshipStatus}
                            onSelect={(value) => updateField('relationshipStatus', value)}
                            options={RELATIONSHIP_STATUS_OPTIONS}
                            placeholder="İlişki durumunuzu seçin (opsiyonel)"
                        />
                    </View>

                    <View style={styles.footer}>
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
    },
    nextButton: {
        marginTop: 8,
    },
});

export default OnboardingStep1;
