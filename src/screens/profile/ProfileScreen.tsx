// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    ScrollView,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
    RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text, Button, ErrorPopup } from '../../components';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';
import * as notificationApi from '../../api/notificationApi';
import * as profileApi from '../../api/profileApi';
import { NotificationResponse, NotificationListResponse } from '../../types/notification';

const ProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, logout, refreshUser } = useAuthStore();
    
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(null);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);

    // Refresh user info when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refreshUser();
            loadNotifications();
        }, [])
    );

    const loadNotifications = async (page = 0, showLoading = true) => {
        if (showLoading) setLoading(true);
        setErrorMessage(null);
        setShowErrorPopup(false);

        try {
            const response = await notificationApi.getUserNotifications(page, 20);
            if (response.success && response.data) {
                const data: NotificationListResponse = response.data;
                if (page === 0) {
                    setNotifications(data.notifications);
                } else {
                    setNotifications(prev => [...prev, ...data.notifications]);
                }
                setUnreadCount(data.unreadCount);
                setCurrentPage(data.currentPage);
                setHasNext(data.hasNext);
            } else {
                setErrorMessage(response.message || 'Bildirimler yüklenirken bir hata oluştu');
                setShowErrorPopup(true);
            }
        } catch (err: any) {
            console.error('Error loading notifications:', err);
            setErrorMessage('Bildirimler yüklenirken bir hata oluştu');
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications(0, false);
    };

    const loadMore = () => {
        if (hasNext && !loading) {
            loadNotifications(currentPage + 1, false);
        }
    };

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

    const handleDeleteAccount = () => {
        Alert.alert(
            'Hesabı Sil',
            'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Hesabı Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await profileApi.deleteAccount();
                            if (response.success) {
                                // Account deleted successfully, logout user
                                await logout();
                            } else {
                                setErrorMessage(response.message || 'Hesap silinirken bir hata oluştu');
                                setShowErrorPopup(true);
                            }
                        } catch (err: any) {
                            console.error('Error deleting account:', err);
                            setErrorMessage('Hesap silinirken bir hata oluştu');
                            setShowErrorPopup(true);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    const SkeletonCard = () => {
        const shimmerAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const shimmer = Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnim, {
                        toValue: 0,
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                ])
            );
            shimmer.start();
            return () => shimmer.stop();
        }, []);

        const opacity = shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
        });

        return (
            <View style={styles.notificationCard}>
                <Animated.View style={[styles.skeletonNotificationIcon, { opacity }]} />
                <View style={styles.skeletonNotificationContent}>
                    <Animated.View style={[styles.skeletonNotificationTitle, { opacity }]} />
                    <Animated.View style={[styles.skeletonNotificationMessage, { opacity }]} />
                </View>
            </View>
        );
    };

    const handleNotificationPress = async (notification: NotificationResponse) => {
        // Mark as read if not already read
        if (!notification.isRead) {
            try {
                const response = await notificationApi.markNotificationAsRead(notification.id);
                if (response.success) {
                    // Update notification in local state
                    setNotifications(prev =>
                        prev.map(n =>
                            n.id === notification.id ? { ...n, isRead: true } : n
                        )
                    );
                    // Update unread count
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            } catch (err) {
                console.error('Error marking notification as read:', err);
            }
        }

        // Show notification popup
        setSelectedNotification(notification);
        setShowNotificationPopup(true);
    };

    const handleNotificationAction = () => {
        setShowNotificationPopup(false);
        
        if (selectedNotification?.actionUrl) {
            // Navigate based on actionUrl
            // Common routes: /tarot, /coffee-fortune, /wheel, etc.
            const actionUrl = selectedNotification.actionUrl;
            
            // Close popup first
            const notification = selectedNotification;
            setSelectedNotification(null);
            
            // Navigate based on actionUrl pattern
            if (actionUrl.includes('/tarot')) {
                navigation.navigate('Home', { screen: 'TarotReaderList' });
            } else if (actionUrl.includes('/coffee-fortune')) {
                navigation.navigate('Home', { screen: 'CoffeeFortune' });
            } else if (actionUrl.includes('/wheel')) {
                navigation.navigate('Home', { screen: 'Wheel' });
            } else if (actionUrl.includes('/tarot/readings/')) {
                // Extract reading ID from URL
                const readingId = actionUrl.split('/tarot/readings/')[1]?.split('/')[0];
                if (readingId) {
                    navigation.navigate('Home', {
                        screen: 'TarotReadingDetail',
                        params: { readingId: parseInt(readingId) },
                    });
                }
            } else if (actionUrl.includes('/coffee-fortune/')) {
                // Extract fortune ID from URL
                const fortuneId = actionUrl.split('/coffee-fortune/')[1]?.split('/')[0];
                if (fortuneId) {
                    navigation.navigate('Home', {
                        screen: 'CoffeeFortuneHistory',
                    });
                }
            }
            // Add more navigation cases as needed
        } else {
            setSelectedNotification(null);
        }
    };

    const renderNotification = (notification: NotificationResponse) => {
        return (
            <TouchableOpacity
                key={notification.id}
                style={[
                    styles.notificationCard,
                    !notification.isRead && styles.notificationCardUnread,
                ]}
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(notification)}>
                {notification.imageUrl ? (
                    <Image
                        source={{ uri: notification.imageUrl }}
                        style={styles.notificationImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.notificationIcon}>
                        <Text style={styles.notificationIconText}>
                            {notification.type === 'FORTUNE_READY' ? '✨' : 
                             notification.type === 'HOROSCOPE' ? '⭐' : 
                             notification.type === 'PROMOTION' ? '🎁' : '🔔'}
                        </Text>
                    </View>
                )}
                <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle} numberOfLines={1}>
                            {notification.title}
                        </Text>
                        {!notification.isRead && (
                            <View style={styles.unreadDot} />
                        )}
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                        {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                        {formatDate(notification.createdAt)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 100 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.MAIN}
                        colors={[COLORS.MAIN]}
                    />
                }>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profil</Text>
                    {unreadCount > 0 && (
                        <TouchableOpacity
                            style={styles.notificationBadge}
                            activeOpacity={0.7}
                            onPress={() => {
                                // Scroll to notifications section
                                // You can implement scroll to section if needed
                            }}>
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
                </View>

                {/* Profile Header */}
                <View style={styles.profileHeaderCard}>
                    <View style={styles.profileHeader}>
                        {user?.profileImageUrl ? (
                            <Image
                                source={{ uri: user.profileImageUrl }}
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarPlaceholderText}>
                                    {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>
                                {user?.fullName || user?.username || 'Kullanıcı'}
                            </Text>
                            <Text style={styles.profileEmail}>{user?.email}</Text>
                            {user?.jeton !== undefined && (
                                <View style={styles.jetonBadge}>
                                    <Text style={styles.jetonIcon}>⭐</Text>
                                    <Text style={styles.jetonText}>{user.jeton}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('EditProfile')}
                        activeOpacity={0.7}>
                        <Text style={styles.actionButtonIcon}>✏️</Text>
                        <Text style={styles.actionButtonText}>Profili Düzenle</Text>
                    </TouchableOpacity>
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Bildirimler</Text>
                        {unreadCount > 0 && (
                            <View style={styles.unreadCountBadge}>
                                <Text style={styles.unreadCountText}>{unreadCount} yeni</Text>
                            </View>
                        )}
                    </View>

                    {loading ? (
                        <>
                            {[1, 2, 3].map((index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </>
                    ) : notifications.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🔔</Text>
                            <Text style={styles.emptyText}>Henüz bildiriminiz yok</Text>
                        </View>
                    ) : (
                        <>
                            {notifications.map(renderNotification)}
                            {hasNext && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={loadMore}
                                    activeOpacity={0.7}>
                                    <Text style={styles.loadMoreText}>Daha fazla yükle</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>

                {/* Logout and Delete Account Buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={styles.logoutCard}
                        onPress={handleLogout}
                        activeOpacity={0.7}>
                        <View style={styles.actionIconContainer}>
                            <Text style={styles.actionIcon}>🚪</Text>
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Çıkış Yap</Text>
                            <Text style={styles.actionSubtitle}>Hesabınızdan güvenli bir şekilde çıkış yapın</Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteAccountCard}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.7}>
                        <View style={[styles.actionIconContainer, styles.deleteIconContainer]}>
                            <Text style={styles.actionIcon}>🗑️</Text>
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, styles.deleteTitle]}>Hesabı Sil</Text>
                            <Text style={[styles.actionSubtitle, styles.deleteSubtitle]}>
                                Hesabınızı kalıcı olarak silin
                            </Text>
                        </View>
                        <Text style={[styles.actionArrow, styles.deleteArrow]}>›</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Error Popup */}
            <ErrorPopup
                visible={showErrorPopup}
                title="Hata"
                message={errorMessage || ''}
                primaryActionLabel="Tamam"
                onPrimaryAction={() => setShowErrorPopup(false)}
                onClose={() => setShowErrorPopup(false)}
            />

            {/* Notification Detail Popup */}
            {selectedNotification && (
                <ErrorPopup
                    visible={showNotificationPopup}
                    title={selectedNotification.title}
                    message={selectedNotification.message}
                    icon={selectedNotification.type === 'FORTUNE_READY' ? '✨' : 
                          selectedNotification.type === 'HOROSCOPE' ? '⭐' : 
                          selectedNotification.type === 'PROMOTION' ? '🎁' : '🔔'}
                    primaryActionLabel={selectedNotification.actionUrl ? 'Git' : 'Tamam'}
                    onPrimaryAction={handleNotificationAction}
                    onClose={() => {
                        setShowNotificationPopup(false);
                        setSelectedNotification(null);
                    }}
                />
            )}
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
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.SECOND,
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
    profileHeaderCard: {
        backgroundColor: '#27192c',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.1)',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: COLORS.MAIN,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.MAIN,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.MAIN,
    },
    avatarPlaceholderText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.BACKGROUND,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.7,
        marginBottom: 8,
    },
    jetonBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.MAIN,
        gap: 4,
    },
    jetonIcon: {
        fontSize: 14,
    },
    jetonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.MAIN,
    },
    actionButtons: {
        marginBottom: 24,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#27192c',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.2)',
        gap: 12,
    },
    actionButtonIcon: {
        fontSize: 20,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.MAIN,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.SECOND,
    },
    unreadCountBadge: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    unreadCountText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF3B30',
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.1)',
        gap: 12,
    },
    notificationCardUnread: {
        borderColor: COLORS.MAIN,
        borderWidth: 1.5,
        backgroundColor: 'rgba(224, 195, 108, 0.05)',
    },
    notificationImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    notificationIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationIconText: {
        fontSize: 24,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.SECOND,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.MAIN,
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: COLORS.SECOND,
        opacity: 0.8,
        marginBottom: 4,
        lineHeight: 20,
    },
    notificationTime: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.6,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
    loadMoreButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    loadMoreText: {
        fontSize: 14,
        color: COLORS.MAIN,
        fontWeight: '600',
    },
    actionSection: {
        marginTop: 20,
        marginBottom: 20,
        gap: 12,
    },
    logoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.2)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    deleteAccountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 59, 48, 0.3)',
        shadowColor: '#FF3B30',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(224, 195, 108, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deleteIconContainer: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
    },
    actionIcon: {
        fontSize: 24,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.SECOND,
        marginBottom: 4,
    },
    deleteTitle: {
        color: '#FF6B6B',
    },
    actionSubtitle: {
        fontSize: 12,
        color: COLORS.SECOND,
        opacity: 0.7,
    },
    deleteSubtitle: {
        color: '#FF6B6B',
        opacity: 0.8,
    },
    actionArrow: {
        fontSize: 24,
        color: COLORS.MAIN,
        fontWeight: '300',
        marginLeft: 8,
    },
    deleteArrow: {
        color: '#FF6B6B',
    },
    // Skeleton Styles
    skeletonContainer: {
        gap: 12,
    },
    skeletonAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
    },
    skeletonInfo: {
        flex: 1,
        gap: 8,
    },
    skeletonName: {
        width: 150,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
    },
    skeletonEmail: {
        width: 200,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
    },
    skeletonNotificationIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
    },
    skeletonNotificationContent: {
        flex: 1,
        gap: 8,
    },
    skeletonNotificationTitle: {
        width: '70%',
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
    },
    skeletonNotificationMessage: {
        width: '100%',
        height: 14,
        borderRadius: 7,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
    },
});

export default ProfileScreen;
