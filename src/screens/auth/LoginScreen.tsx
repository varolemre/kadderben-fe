// @ts-nocheck
import React from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Image,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '../../components';
import { COLORS } from '../../utils/constants';

const welcomeImage = require('../../assets/welcomePicture.png');

const LoginScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image 
                        source={welcomeImage} 
                        style={styles.welcomeImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.bottomSection}>
                    <View style={styles.header}>
                        <Text style={styles.title}>KadderBal'a Hoş Geldiniz</Text>
                        <Text style={styles.subtitle}>Devam etmek için bir yöntem seçin</Text>
                    </View>

                    <View style={styles.oauthContainer}>
                        <Button
                            title="Google ile Devam Et"
                            onPress={() => Alert.alert('Yakında', 'Google ile giriş yakında eklenecek')}
                            variant="outline"
                            style={styles.oauthButton}
                            textStyle={styles.oauthButtonText}
                            disabled
                        />

                        <Button
                            title="Apple ile Devam Et"
                            onPress={() => Alert.alert('Yakında', 'Apple ile giriş yakında eklenecek')}
                            variant="outline"
                            style={styles.oauthButton}
                            textStyle={styles.oauthButtonText}
                            disabled
                        />

                        <Button
                            title="E-posta ile Devam Et"
                            onPress={() => navigation.navigate('LoginWithEmail')}
                            variant="outline"
                            style={styles.oauthButton}
                            textStyle={styles.oauthButtonText}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 10,
        minHeight: 420,
    },
    welcomeImage: {
        width: '100%',
        height: 420,
        maxWidth: '100%',
    },
    bottomSection: {
        paddingBottom: 60,
    },
    header: {
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'left',
    },
    oauthContainer: {
        marginTop: 16,
    },
    oauthButton: {
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    oauthButtonText: {
        color: '#FFFFFF',
    },
});

export default LoginScreen;
