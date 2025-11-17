// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Text } from './Text';
import { COLORS } from '../utils/constants';
import * as storyApi from '../api/storyApi';

interface Story {
    id: number;
    imageUrl: string;
    previewImageUrl: string;
    isActive: boolean;
    createdAt: string;
}

const StoryItem = ({ story, onPress, isFirst }) => {
    return (
        <TouchableOpacity
            style={[styles.storyItem, isFirst && styles.firstStoryItem]}
            onPress={onPress}
            activeOpacity={0.8}>
            <View style={styles.storyImageContainer}>
                <Image
                    source={{ uri: story.previewImageUrl || story.imageUrl }}
                    style={styles.storyImage}
                    resizeMode="cover"
                />
            </View>
        </TouchableOpacity>
    );
};

const StorySection = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        try {
            setLoading(true);
            const response = await storyApi.getLatestStories();
            if (response.success && response.data) {
                setStories(response.data);
            }
        } catch (error) {
            console.error('Error loading stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStoryPress = (story: Story) => {
        // TODO: Open story viewer modal
        console.log('Story pressed:', story.id);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.MAIN} />
                </View>
            </View>
        );
    }

    if (stories.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {stories.map((story, index) => (
                    <StoryItem
                        key={story.id}
                        story={story}
                        onPress={() => handleStoryPress(story)}
                        isFirst={index === 0}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    scrollContent: {
        paddingLeft: 0,
        paddingRight: 12,
        paddingVertical: 8,
    },
    storyItem: {
        marginLeft: 0,
        marginRight: 12,
        alignItems: 'center',
    },
    firstStoryItem: {
        marginLeft: 0,
    },
    storyImageContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: COLORS.MAIN,
        padding: 2,
    },
    storyImage: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
});

export default StorySection;

