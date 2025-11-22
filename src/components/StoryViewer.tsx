// @ts-nocheck
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from './Text';
import { COLORS } from '../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Story {
    id: number;
    imageUrl: string;
    previewImageUrl: string;
    isActive: boolean;
    createdAt: string;
}

interface StoryViewerProps {
    visible: boolean;
    story: Story | null;
    onClose: () => void;
}

const StoryViewer = ({ visible, story, onClose }: StoryViewerProps) => {
    const [imageLoading, setImageLoading] = useState(true);

    if (!story) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.content}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}>
                        <Text style={styles.closeIcon}>✕</Text>
                    </TouchableOpacity>

                    {/* Story Image */}
                    <View style={styles.imageContainer}>
                        {imageLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.MAIN} />
                            </View>
                        )}
                        <Image
                            source={{ uri: story.imageUrl }}
                            style={styles.storyImage}
                            resizeMode="contain"
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    closeIcon: {
        fontSize: 24,
        color: COLORS.SECOND,
        fontWeight: 'bold',
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    loadingContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
});

export default StoryViewer;

