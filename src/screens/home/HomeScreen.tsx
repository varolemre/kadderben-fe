// @ts-nocheck
import React from 'react';
import {
    View,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '../../components';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

const HomeScreen = () => {
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
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
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome! 👋</Text>
                    <Text style={styles.subtitle}>{user?.fullName || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Account Info</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Provider:</Text>
                        <Text style={styles.infoValue}>{user?.provider || 'EMAIL'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Role:</Text>
                        <Text style={styles.infoValue}>{user?.role || 'USER'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email Verified:</Text>
                        <Text style={styles.infoValue}>
                            {user?.emailVerified ? '✅ Yes' : '❌ No'}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Logout"
                        onPress={handleLogout}
                        variant="outline"
                    />
                </View>
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
    header: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 20,
        color: COLORS.SECOND,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: COLORS.SECOND,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
    },
    infoValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '600',
    },
    footer: {
        marginTop: 'auto',
    },
});

export default HomeScreen;
