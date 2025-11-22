// Image Picker Helper
// Note: Requires react-native-image-picker to be installed:
// npm install react-native-image-picker
// For iOS: cd ios && pod install
// For Android: Add permissions to AndroidManifest.xml

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

/**
 * Open camera to take a photo
 * @returns {Promise<{uri: string, name: string, type: string} | null>}
 */
export const takePhoto = () => {
    return new Promise((resolve) => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            includeBase64: false,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                resolve(null);
            } else if (response.errorMessage) {
                console.error('Camera error:', response.errorMessage);
                resolve(null);
            } else if (response.assets && response.assets[0]) {
                const asset = response.assets[0];
                resolve({
                    uri: asset.uri,
                    name: asset.fileName || 'coffee-cup.jpg',
                    type: asset.type || 'image/jpeg',
                });
            } else {
                resolve(null);
            }
        });
    });
};

/**
 * Open gallery to pick a photo
 * @returns {Promise<{uri: string, name: string, type: string} | null>}
 */
export const pickFromGallery = () => {
    return new Promise((resolve) => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            includeBase64: false,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                resolve(null);
            } else if (response.errorMessage) {
                console.error('Gallery error:', response.errorMessage);
                resolve(null);
            } else if (response.assets && response.assets[0]) {
                const asset = response.assets[0];
                resolve({
                    uri: asset.uri,
                    name: asset.fileName || 'coffee-cup.jpg',
                    type: asset.type || 'image/jpeg',
                });
            } else {
                resolve(null);
            }
        });
    });
};

