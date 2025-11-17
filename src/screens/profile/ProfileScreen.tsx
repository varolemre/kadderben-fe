// @ts-nocheck
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

const ProfileScreen = () => {
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Profil</Text>
                {user && (
                    <View style={styles.userInfo}>
                        <Text style={styles.label}>E-posta:</Text>
                        <Text style={styles.value}>{user.email}</Text>
                    </View>
                )}
                <Button
                    title="Çıkış Yap"
                    onPress={handleLogout}
                    style={[styles.logoutButton, { backgroundColor: COLORS.MAIN }]}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 32,
    },
    userInfo: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: COLORS.SECOND,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: COLORS.SECOND,
        fontWeight: '600',
    },
    logoutButton: {
        marginTop: 24,
    },
});

export default ProfileScreen;

