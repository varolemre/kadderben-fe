// @ts-nocheck
import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FortuneCard } from '../../components';
import StorySection from '../../components/StorySection';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

const carkFaliImage = require('../../assets/img/carkfali.png');
const kahveFaliImage = require('../../assets/img/kahvefali.png');
const kurabiyeImage = require('../../assets/img/kurabiye.png');
const tarotImage = require('../../assets/img/tarot.png');

const HomeScreen = () => {
    const { user } = useAuthStore();

    const handleFortuneCardPress = (type: string) => {
        // TODO: Navigate to fortune screen based on type
        console.log(`${type} card pressed`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                {/* Header with Logo and Jeton */}
                <View style={styles.topHeader}>
                    <Image
                        source={require('../../assets/img/kadderballogo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.jetonContainer}>
                        <View style={styles.jetonBadge}>
                            <Text style={styles.jetonIcon}>⭐</Text>
                            <Text style={styles.jetonText}>{user?.jeton || 0}</Text>
                        </View>
                    </View>
                </View>

                {/* Story Section */}
                <StorySection />

                {/* Fortune Cards */}
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

                {/* Side by Side Fortune Cards */}
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
        paddingBottom: 40,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: -10,
        marginBottom: 16,
    },
    logo: {
        width: 120,
        height: 40,
    },
    jetonContainer: {
        alignItems: 'flex-end',
    },
    jetonBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.MAIN,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    jetonIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    jetonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
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
