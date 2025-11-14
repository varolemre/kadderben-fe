import { create } from 'zustand';

const useOnboardingStore = create((set, get) => ({
    // Onboarding form data
    formData: {
        gender: null,
        birthDate: null,
        birthTime: null,
        birthCountry: null,
        birthCity: null,
        occupation: null,
        relationshipStatus: null,
        notificationsEnabled: true,
    },

    // Update form field
    updateField: (field, value) => {
        set((state) => ({
            formData: {
                ...state.formData,
                [field]: value,
            },
        }));
    },

    // Reset form
    resetForm: () => {
        set({
            formData: {
                gender: null,
                birthDate: null,
                birthTime: null,
                birthCountry: null,
                birthCity: null,
                occupation: null,
                relationshipStatus: null,
                notificationsEnabled: true,
            },
        });
    },
}));

export default useOnboardingStore;

