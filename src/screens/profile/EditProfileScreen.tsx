// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Dropdown, Text, Input, Switch, ErrorPopup } from '../../components';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';
import * as profileApi from '../../api/profileApi';
import { ProfileUpdateRequest, Gender, OccupationType, RelationshipStatus, ProfileResponse } from '../../types/profile';
import {
    GENDER_OPTIONS,
    COUNTRY_OPTIONS,
    CITY_OPTIONS,
    OCCUPATION_OPTIONS,
    RELATIONSHIP_STATUS_OPTIONS,
} from '../../utils/onboardingData';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { refreshUser } = useAuthStore();
    
    const [formData, setFormData] = useState<ProfileUpdateRequest>({});
    const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Format date for display (YYYY-MM-DD -> DD/MM/YYYY)
    const formatDateForDisplay = (dateString?: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Get initial date from profileData
    const getInitialDate = () => {
        if (profileData?.birthDate) {
            const [year, month, day] = profileData.birthDate.split('-');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        }
        return new Date(2000, 0, 1, 12, 0, 0);
    };

    // Get initial time from profileData
    const getInitialTime = () => {
        if (profileData?.birthTime) {
            const [hours, minutes] = profileData.birthTime.split(':');
            return new Date(2000, 0, 1, parseInt(hours), parseInt(minutes), 0);
        }
        return new Date(2000, 0, 1, 12, 0, 0);
    };

    const [selectedDate, setSelectedDate] = useState(getInitialDate());
    const [selectedTime, setSelectedTime] = useState(getInitialTime());
    const [timeUnknown, setTimeUnknown] = useState(!profileData?.birthTime);

    // Load profile data on mount
    useEffect(() => {
        loadProfile();
    }, []);

    // Update form data when profile data is loaded
    useEffect(() => {
        if (profileData) {
            setFormData({
                fullName: profileData.fullName || '',
                gender: profileData.gender as Gender || undefined,
                birthDate: profileData.birthDate || undefined,
                birthTime: profileData.birthTime || undefined,
                birthCountry: profileData.birthCountry || undefined,
                birthCity: profileData.birthCity || undefined,
                occupation: profileData.occupation as OccupationType || undefined,
                relationshipStatus: profileData.relationshipStatus as RelationshipStatus || undefined,
                notificationsEnabled: profileData.notificationsEnabled ?? true,
                dailyHoroscopeEnabled: profileData.dailyHoroscopeEnabled ?? true,
                preferredLanguage: profileData.preferredLanguage || 'tr',
            });
            setSelectedDate(getInitialDate());
            setSelectedTime(getInitialTime());
            setTimeUnknown(!profileData.birthTime);
        }
    }, [profileData]);

    const loadProfile = async () => {
        setLoading(true);
        setErrorMessage(null);
        setShowErrorPopup(false);

        try {
            const response = await profileApi.getUserProfile();
            if (response.success && response.data) {
                setProfileData(response.data);
            } else {
                setErrorMessage(response.message || 'Profil bilgileri yüklenirken bir hata oluştu');
                setShowErrorPopup(true);
            }
        } catch (err: any) {
            console.error('Error loading profile:', err);
            setErrorMessage('Profil bilgileri yüklenirken bir hata oluştu');
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            // Use UTC to avoid timezone issues
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            setFormData(prev => ({ ...prev, birthDate: formattedDate }));
            setSelectedDate(date);
        }
    };

    const handleTimeChange = (event: any, time?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (time && !timeUnknown) {
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            setFormData(prev => ({ ...prev, birthTime: formattedTime }));
            setSelectedTime(time);
        }
    };

    const handleTimeUnknownToggle = () => {
        const newValue = !timeUnknown;
        setTimeUnknown(newValue);
        if (newValue) {
            setFormData(prev => ({ ...prev, birthTime: undefined }));
        } else {
            const hours = String(selectedTime.getHours()).padStart(2, '0');
            const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
            setFormData(prev => ({ ...prev, birthTime: `${hours}:${minutes}` }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setErrorMessage(null);
        setShowErrorPopup(false);

        try {
            const response = await profileApi.updateUserProfile(formData);
            if (response.success) {
                await refreshUser();
                Alert.alert('Başarılı', response.message || 'Profil başarıyla güncellendi', [
                    { text: 'Tamam', onPress: () => navigation.goBack() },
                ]);
            } else {
                setErrorMessage(response.message || 'Profil güncellenirken bir hata oluştu');
                setShowErrorPopup(true);
            }
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setErrorMessage('Profil güncellenirken bir hata oluştu');
            setShowErrorPopup(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.MAIN} />
                    <Text style={styles.loadingText}>Profil bilgileri yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: 100 + insets.bottom },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profili Düzenle</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Ad Soyad"
                            value={formData.fullName || ''}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                            placeholder="Adınızı ve soyadınızı girin"
                        />

                        <Dropdown
                            label="Cinsiyet"
                            value={formData.gender}
                            onSelect={(value) => setFormData(prev => ({ ...prev, gender: value as Gender }))}
                            options={GENDER_OPTIONS}
                            placeholder="Cinsiyetinizi seçin"
                        />

                        <Dropdown
                            label="Ülke"
                            value={formData.birthCountry}
                            onSelect={(value) => setFormData(prev => ({ ...prev, birthCountry: value }))}
                            options={COUNTRY_OPTIONS}
                            placeholder="Ülkenizi seçin"
                        />

                        <Dropdown
                            label="Şehir"
                            value={formData.birthCity}
                            onSelect={(value) => setFormData(prev => ({ ...prev, birthCity: value }))}
                            options={CITY_OPTIONS}
                            placeholder="Şehrinizi seçin"
                        />

                        <Dropdown
                            label="Meslek"
                            value={formData.occupation}
                            onSelect={(value) => setFormData(prev => ({ ...prev, occupation: value as OccupationType }))}
                            options={OCCUPATION_OPTIONS}
                            placeholder="Mesleğinizi seçin"
                        />

                        <Dropdown
                            label="İlişki Durumu"
                            value={formData.relationshipStatus}
                            onSelect={(value) => setFormData(prev => ({ ...prev, relationshipStatus: value as RelationshipStatus }))}
                            options={RELATIONSHIP_STATUS_OPTIONS}
                            placeholder="İlişki durumunuzu seçin"
                        />

                        {/* Birth Date */}
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.label}>Doğum Tarihi</Text>
                            <TouchableOpacity
                                style={styles.dateTimeButton}
                                onPress={() => setShowDatePicker(true)}>
                                <Text style={styles.dateTimeText}>
                                    {formData.birthDate ? formatDateForDisplay(formData.birthDate) : 'GG/AA/YYYY'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Birth Time */}
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.label}>Doğum Saati</Text>
                            <TouchableOpacity
                                style={styles.dateTimeButton}
                                onPress={() => !timeUnknown && setShowTimePicker(true)}
                                disabled={timeUnknown}>
                                <Text style={[styles.dateTimeText, timeUnknown && styles.dateTimeTextDisabled]}>
                                    {timeUnknown ? 'Bilmiyorum' : (formData.birthTime || 'Saat seçin')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.unknownButton}
                                onPress={handleTimeUnknownToggle}>
                                <Text style={[styles.unknownButtonText, timeUnknown && styles.unknownButtonTextActive]}>
                                    Bilmiyorum
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Notifications */}
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Bildirimleri Etkinleştir</Text>
                            <View style={styles.switchWrapper}>
                                <Switch
                                    value={formData.notificationsEnabled ?? true}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, notificationsEnabled: value }))}
                                    style={styles.switchStyle}
                                />
                            </View>
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Günlük Burç Bildirimi</Text>
                            <View style={styles.switchWrapper}>
                                <Switch
                                    value={formData.dailyHoroscopeEnabled ?? true}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, dailyHoroscopeEnabled: value }))}
                                    style={styles.switchStyle}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Save Button */}
                    <View style={styles.footer}>
                        <Button
                            title="Kaydet"
                            onPress={handleSave}
                            disabled={saving}
                            style={[styles.saveButton, { backgroundColor: COLORS.MAIN }]}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Date Picker Modal */}
            {Platform.OS === 'ios' && (
                <Modal
                    visible={showDatePicker}
                    transparent
                    animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.modalButtonText}>İptal</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Doğum Tarihi</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.modalButtonText}>Tamam</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                                locale="tr_TR"
                            />
                        </View>
                    </View>
                </Modal>
            )}

            {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}

            {/* Time Picker Modal */}
            {Platform.OS === 'ios' && (
                <Modal
                    visible={showTimePicker}
                    transparent
                    animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                    <Text style={styles.modalButtonText}>İptal</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Doğum Saati</Text>
                                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                    <Text style={styles.modalButtonText}>Tamam</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={selectedTime}
                                mode="time"
                                display="spinner"
                                is24Hour={true}
                                onChange={handleTimeChange}
                                locale="tr_TR"
                            />
                        </View>
                    </View>
                </Modal>
            )}

            {Platform.OS === 'android' && showTimePicker && (
                <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="default"
                    is24Hour={true}
                    onChange={handleTimeChange}
                />
            )}

            {/* Error Popup */}
            <ErrorPopup
                visible={showErrorPopup}
                title="Hata"
                message={errorMessage || ''}
                primaryActionLabel="Tamam"
                onPrimaryAction={() => setShowErrorPopup(false)}
                onClose={() => setShowErrorPopup(false)}
            />
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 28,
        color: COLORS.SECOND,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.SECOND,
    },
    placeholder: {
        width: 40,
    },
    form: {
        gap: 12,
    },
    dateTimeContainer: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.SECOND,
        marginBottom: 8,
    },
    dateTimeButton: {
        backgroundColor: '#27192c',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.2)',
    },
    dateTimeText: {
        fontSize: 16,
        color: COLORS.SECOND,
    },
    dateTimeTextDisabled: {
        opacity: 0.5,
    },
    unknownButton: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    unknownButtonText: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
    unknownButtonTextActive: {
        color: COLORS.MAIN,
        opacity: 1,
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#27192c',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.2)',
        minHeight: 56,
    },
    switchLabel: {
        fontSize: 16,
        color: COLORS.SECOND,
        flex: 1,
    },
    switchWrapper: {
        marginLeft: 12,
    },
    switchStyle: {
        marginBottom: 0,
    },
    footer: {
        marginTop: 24,
        marginBottom: 20,
    },
    saveButton: {
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.BACKGROUND,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(224, 195, 108, 0.2)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.SECOND,
    },
    modalButtonText: {
        fontSize: 16,
        color: COLORS.MAIN,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
});

export default EditProfileScreen;

