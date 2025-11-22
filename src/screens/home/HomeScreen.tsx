// @ts-nocheck
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text, FortuneCard } from '../../components';
import StorySection from '../../components/StorySection';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';
import * as notificationApi from '../../api/notificationApi';
import { NotificationListResponse } from '../../types/notification';

const carkFaliImage = require('../../assets/img/carkfali.png');
const kahveFaliImage = require('../../assets/img/kahvefali.png');
const kurabiyeImage = require('../../assets/img/kurabiye.png');
const tarotImage = require('../../assets/img/tarot.png');

const HomeScreen = ({ navigation }) => {
    const { user, refreshUser } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);

    // Refresh user info and notifications when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refreshUser();
            loadNotifications();
        }, [])
    );

    const loadNotifications = async () => {
        try {
            const response = await notificationApi.getUserNotifications(0, 1);
            if (response.success && response.data) {
                const data: NotificationListResponse = response.data;
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error('Error loading notifications:', err);
        }
    };

    const handleFortuneCardPress = (type: string) => {
        if (type === 'Çark Falı') {
            navigation.navigate('Wheel');
        } else if (type === 'Kahve Falı') {
            navigation.navigate('CoffeeFortune');
        } else if (type === 'Tarot') {
            navigation.navigate('TarotReaderList');
        } else if (type === 'Şanslı Kurabiye') {
            navigation.navigate('LuckyCookie');
        } else if (type === 'Düşünceyi Yak') {
            navigation.navigate('BurnThought');
        } else if (type === 'Size Özel') {
            navigation.navigate('MyZodiac');
        } else {
            // TODO: Navigate to other fortune screens
            console.log(`${type} card pressed`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                {/* Header with Logo, Notifications and Jeton */}
                <View style={styles.topHeader}>
                    <Image
                        source={require('../../assets/img/kadderballogo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.badgesContainer}>
                        {unreadCount > 0 && (
                            <TouchableOpacity
                                style={styles.notificationBadge}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain' })}>
                                <View style={styles.notificationBadgeIcon}>
                                    <Text style={styles.notificationBadgeIconText}>🔔</Text>
                                </View>
                                <View style={styles.notificationBadgeCount}>
                                    <Text style={styles.notificationBadgeCountText}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        <View style={styles.jetonBadge}>
                            <Text style={styles.jetonIcon}>⭐</Text>
                            <Text style={styles.jetonText}>{user?.jeton || 0}</Text>
                        </View>
                    </View>
                </View>

                {/* Story Section */}
                <StorySection />

                {/* Full Row Fortune Cards */}
                <FortuneCard
                    imageSource={carkFaliImage}
                    title="Çark Falı"
                    subtitle="Çarkınızı çevirmeye hazır mısınız?"
                    onPress={() => handleFortuneCardPress('Çark Falı')}
                />
                <FortuneCard
                    imageSource={kahveFaliImage}
                    title="Kahve Falı"
                    subtitle="Kahve telvenizdeki sırları keşfedin"
                    onPress={() => handleFortuneCardPress('Kahve Falı')}
                />

                {/* Side by Side Fortune Cards - Şanslı Kurabiye and Tarot */}
                <View style={styles.rowContainer}>
                    <View style={styles.halfCard}>
                        <FortuneCard
                            imageSource={kurabiyeImage}
                            title="Şanslı Kurabiye"
                            subtitle="Mesajınızı okuyun"
                            onPress={() => handleFortuneCardPress('Şanslı Kurabiye')}
                            style={styles.sideBySideCard}
                            compact={true}
                        />
                    </View>
                    <View style={styles.halfCard}>
                        <FortuneCard
                            imageSource={tarotImage}
                            title="Tarot"
                            subtitle="Kartlarınızın sırrını keşfedin"
                            onPress={() => handleFortuneCardPress('Tarot')}
                            style={styles.sideBySideCard}
                            compact={true}
                        />
                    </View>
                </View>

                {/* Side by Side Fortune Cards - Size Özel and Düşünceyi Yak */}
                <View style={styles.rowContainer}>
                    <View style={styles.halfCard}>
                        <FortuneCard
                            imageSource={require('../../assets/img/ozel.png')}
                            title="Size Özel"
                            subtitle="Yıldız haritanızı keşfedin"
                            onPress={() => handleFortuneCardPress('Size Özel')}
                            style={styles.sideBySideCard}
                            compact={true}
                        />
                    </View>
                    <View style={styles.halfCard}>
                        <FortuneCard
                            imageSource={require('../../assets/img/burn.png')}
                            title="Düşünceyi Yak"
                            subtitle="Olumsuz düşüncelerini bırak"
                            onPress={() => handleFortuneCardPress('Düşünceyi Yak')}
                            style={styles.sideBySideCard}
                            compact={true}
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 32,
        maxWidth: 430,
        alignSelf: 'center',
        width: '100%',
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 16,
    },
    logo: {
        width: 120,
        height: 40,
    },
    badgesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    notificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#27192c',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.3)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    notificationBadgeIcon: {
        marginRight: 5,
    },
    notificationBadgeIconText: {
        fontSize: 13,
    },
    notificationBadgeCount: {
        backgroundColor: COLORS.MAIN,
        borderRadius: 8,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    notificationBadgeCountText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.BACKGROUND,
    },
    jetonBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.MAIN,
        gap: 4,
    },
    jetonIcon: {
        fontSize: 12,
    },
    jetonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.MAIN,
    },
    rowContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    halfCard: {
        flex: 1,
    },
    sideBySideCard: {
        marginBottom: 0,
    },
});

export default HomeScreen;
