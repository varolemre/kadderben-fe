// @ts-nocheck
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '../../components';
import useOnboardingStore from '../../store/onboardingStore';
import { COLORS } from '../../utils/constants';

// Import DateTimePicker
import DateTimePicker from '@react-native-community/datetimepicker';

const OnboardingStep3 = ({ navigation }) => {
    const { formData, updateField } = useOnboardingStore();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Convert YYYY-MM-DD to DD/MM/YYYY for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Convert DD/MM/YYYY to YYYY-MM-DD for backend
    const formatDateForBackend = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    };

    // Get initial date from formData or use current date
    const getInitialDate = () => {
        if (formData.birthDate) {
            const [year, month, day] = formData.birthDate.split('-');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return new Date(2000, 0, 1); // Default to Jan 1, 2000
    };

    // Get initial time from formData or use current time
    const getInitialTime = () => {
        if (formData.birthTime) {
            const [hours, minutes] = formData.birthTime.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return date;
        }
        return new Date();
    };

    const [selectedDate, setSelectedDate] = useState(getInitialDate());
    const [selectedTime, setSelectedTime] = useState(getInitialTime());
    const [showDontKnowTime, setShowDontKnowTime] = useState(!formData.birthTime);

    const isFormValid = formData.birthDate !== null;

    const handleDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (event.type === 'dismissed') {
                return;
            }
        }
        if (date) {
            setSelectedDate(date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            updateField('birthDate', formattedDate);
            if (Platform.OS === 'ios') {
                setShowDatePicker(false);
            }
        }
    };

    const handleTimeChange = (event, time) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
            if (event.type === 'dismissed') {
                return;
            }
        }
        if (time && !showDontKnowTime) {
            setSelectedTime(time);
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            updateField('birthTime', formattedTime);
            if (Platform.OS === 'ios') {
                setShowTimePicker(false);
            }
        }
    };

    const handleDontKnowTime = () => {
        setShowDontKnowTime(true);
        updateField('birthTime', null);
    };

    const handleSelectTime = () => {
        setShowDontKnowTime(false);
        setShowTimePicker(true);
    };

    const handleNext = () => {
        if (isFormValid) {
            navigation.navigate('OnboardingStep4');
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
                        <Text style={styles.title}>Doğum Bilgileri</Text>
                        <Text style={styles.subtitle}>Doğum tarihinizi ve saatini seçin</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>
                                Doğum Tarihi <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={styles.dateTimeButton}
                                onPress={() => setShowDatePicker(true)}>
                                <Text style={[styles.dateTimeText, !formData.birthDate && styles.placeholder]}>
                                    {formData.birthDate ? formatDateForDisplay(formData.birthDate) : 'GG/AA/YYYY seçin'}
                                </Text>
                                <Text style={styles.arrow}>📅</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Doğum Saati (Opsiyonel)</Text>
                            {showDontKnowTime ? (
                                <View style={styles.timeOptionsContainer}>
                                    <TouchableOpacity
                                        style={styles.timeOptionButton}
                                        onPress={handleSelectTime}>
                                        <Text style={styles.timeOptionText}>Saat Seç</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.timeOptionButton, styles.dontKnowButton]}
                                        onPress={handleDontKnowTime}>
                                        <Text style={styles.timeOptionText}>Bilmiyorum</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.timeOptionsContainer}>
                                    <TouchableOpacity
                                        style={styles.dateTimeButton}
                                        onPress={() => setShowTimePicker(true)}>
                                        <Text style={styles.dateTimeText}>
                                            {formData.birthTime || 'Saat seçin'}
                                        </Text>
                                        <Text style={styles.arrow}>🕐</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.dontKnowSmallButton}
                                        onPress={handleDontKnowTime}>
                                        <Text style={styles.dontKnowText}>Bilmiyorum</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {Platform.OS === 'ios' ? (
                        <>
                            <Modal
                                visible={showDatePicker}
                                transparent
                                animationType="slide"
                                onRequestClose={() => setShowDatePicker(false)}>
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContent}>
                                        <View style={styles.modalHeader}>
                                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                <Text style={styles.modalCancel}>İptal</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.modalTitle}>Doğum Tarihi</Text>
                                            <TouchableOpacity onPress={() => {
                                                if (selectedDate) {
                                                    handleDateChange({ type: 'set' }, selectedDate);
                                                }
                                            }}>
                                                <Text style={styles.modalDone}>Tamam</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={selectedDate}
                                            mode="date"
                                            display="spinner"
                                            onChange={(event, date) => {
                                                if (date) {
                                                    setSelectedDate(date);
                                                }
                                            }}
                                            maximumDate={new Date()}
                                            locale="tr-TR"
                                            style={styles.picker}
                                        />
                                    </View>
                                </View>
                            </Modal>

                            <Modal
                                visible={showTimePicker}
                                transparent
                                animationType="slide"
                                onRequestClose={() => setShowTimePicker(false)}>
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContent}>
                                        <View style={styles.modalHeader}>
                                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                                <Text style={styles.modalCancel}>İptal</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.modalTitle}>Doğum Saati</Text>
                                            <TouchableOpacity onPress={() => {
                                                if (selectedTime) {
                                                    handleTimeChange({ type: 'set' }, selectedTime);
                                                }
                                            }}>
                                                <Text style={styles.modalDone}>Tamam</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={selectedTime}
                                            mode="time"
                                            display="spinner"
                                            onChange={(event, time) => {
                                                if (time) {
                                                    setSelectedTime(time);
                                                }
                                            }}
                                            is24Hour={true}
                                            locale="tr-TR"
                                            style={styles.picker}
                                        />
                                    </View>
                                </View>
                            </Modal>
                        </>
                    ) : (
                        <>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={selectedDate}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                    locale="tr-TR"
                                />
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    value={selectedTime}
                                    mode="time"
                                    display="default"
                                    onChange={handleTimeChange}
                                    is24Hour={true}
                                    locale="tr-TR"
                                />
                            )}
                        </>
                    )}

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
    fieldContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: '#FF3B30',
    },
    dateTimeButton: {
        height: 50,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
    },
    dateTimeText: {
        fontSize: 16,
        color: '#000',
        flex: 1,
    },
    placeholder: {
        color: '#999',
    },
    arrow: {
        fontSize: 20,
        marginLeft: 8,
    },
    timeOptionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    timeOptionButton: {
        flex: 1,
        height: 50,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    dontKnowButton: {
        backgroundColor: '#F9F9F9',
    },
    timeOptionText: {
        fontSize: 16,
        color: '#000',
    },
    dontKnowSmallButton: {
        paddingHorizontal: 16,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dontKnowText: {
        fontSize: 14,
        color: '#007AFF',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    modalCancel: {
        fontSize: 16,
        color: '#666',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    modalDone: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    picker: {
        height: 200,
    },
});

export default OnboardingStep3;
