// @ts-nocheck
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Platform,
} from 'react-native';
import Text from './Text';
import TextInput from './TextInput';
import { COLORS } from '../utils/constants';

// Clipboard API - React Native'de deprecated ama hala çalışıyor
// @ts-ignore - Clipboard deprecated API
import { Clipboard } from 'react-native';

const COMMON_EMAIL_DOMAINS = [
    'gmail.com',
    'icloud.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'protonmail.com',
];

const Input = ({
                   label,
                   value,
                   onChangeText,
                   placeholder,
                   secureTextEntry = false,
                   keyboardType = 'default',
                   autoCapitalize = 'none',
                   error,
                   editable = true,
                   style,
                   showPasswordToggle = false,
                   enableEmailSuggestions = false,
                   showPasteButton = false,
               }) => {
    const [isSecure, setIsSecure] = useState(secureTextEntry);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleEmailChange = (text) => {
        onChangeText(text);

        if (enableEmailSuggestions && text.includes('@')) {
            const [localPart, domain] = text.split('@');

            if (domain !== undefined && domain.length > 0) {
                // Filter domains that start with the typed domain
                const filteredDomains = COMMON_EMAIL_DOMAINS.filter(d =>
                    d.toLowerCase().startsWith(domain.toLowerCase())
                );

                // Create full email suggestions
                const emailSuggestions = filteredDomains.map(d => `${localPart}@${d}`);

                setSuggestions(emailSuggestions);
                setShowSuggestions(emailSuggestions.length > 0);
            } else if (domain === '') {
                // Just typed @, show all domains
                const emailSuggestions = COMMON_EMAIL_DOMAINS.map(d => `${localPart}@${d}`);
                setSuggestions(emailSuggestions);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (suggestion) => {
        onChangeText(suggestion);
        setShowSuggestions(false);
    };

    const handlePaste = async () => {
        try {
            const content = await Clipboard.getString();
            if (content) {
                onChangeText(content.trim());
            }
        } catch (error) {
            console.error('Paste error:', error);
        }
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        error && styles.inputError,
                        !editable && styles.inputDisabled,
                    ]}
                    value={value}
                    onChangeText={enableEmailSuggestions ? handleEmailChange : onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    secureTextEntry={isSecure}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    autoCorrect={false}
                />

                {showPasteButton && (
                    <TouchableOpacity
                        style={styles.pasteButton}
                        onPress={handlePaste}>
                        <Text style={styles.pasteText}>📋</Text>
                    </TouchableOpacity>
                )}

                {showPasswordToggle && secureTextEntry && (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setIsSecure(!isSecure)}>
                        <Text style={styles.eyeText}>{isSecure ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Email Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.suggestionItem}
                                onPress={() => selectSuggestion(item)}>
                                <Text style={styles.suggestionText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        zIndex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.SECOND,
        marginBottom: 8,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        height: 50,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        color: '#000',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    inputDisabled: {
        backgroundColor: '#F2F2F7',
        color: '#999',
    },
    pasteButton: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    pasteText: {
        fontSize: 20,
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    eyeText: {
        fontSize: 20,
    },
    errorText: {
        fontSize: 12,
        color: '#FF3B30',
        marginTop: 4,
        marginLeft: 4,
    },
    suggestionsContainer: {
        marginTop: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        maxHeight: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    suggestionItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    suggestionText: {
        fontSize: 16,
        color: '#007AFF',
    },
});

export default Input;
