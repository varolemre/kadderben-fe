// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    Animated,
    Easing,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { Text, Button } from '../../components';
import { COLORS } from '../../utils/constants';

const burnAnimation = require('../../assets/lottie/burn_note.json');

const BurnThoughtScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [thought, setThought] = useState('');
    const [isBurning, setIsBurning] = useState(false);
    const [hasBurned, setHasBurned] = useState(false);
    const [comfortMessageVisible, setComfortMessageVisible] = useState(false);

    const lottieRef = useRef<LottieView>(null);
    const lottieRef2 = useRef<LottieView>(null);
    const lottieRef3 = useRef<LottieView>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const noteOpacity = useRef(new Animated.Value(0)).current;
    const noteScale = useRef(new Animated.Value(0.8)).current;
    const textFadeAnim = useRef(new Animated.Value(1)).current;
    const textScaleAnim = useRef(new Animated.Value(1)).current;
    const textColorAnim = useRef(new Animated.Value(0)).current; // 0 = normal, 1 = ash/gray
    const glowAnim = useRef(new Animated.Value(0.3)).current;
    const comfortMessageAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isBurning) {
            // Start the burning sequence
            startBurningAnimation();
        }
    }, [isBurning]);

    const startBurningAnimation = () => {
        // Step 1: Fade out input and button
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Step 2: Show note with text
            Animated.parallel([
                Animated.timing(noteOpacity, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(noteScale, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Step 3: Start glow pulse
                const glowAnimation = Animated.loop(
                    Animated.sequence([
                        Animated.timing(glowAnim, {
                            toValue: 0.8,
                            duration: 1000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: false,
                        }),
                        Animated.timing(glowAnim, {
                            toValue: 0.3,
                            duration: 1000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: false,
                        }),
                    ])
                );
                glowAnimation.start();

                // Step 4: Start Lottie animations
                lottieRef.current?.play();
                lottieRef2.current?.play();
                lottieRef3.current?.play();

                // Step 5: Text will fade during burning, but ash animation happens after Lottie finishes
                // (handled in handleAnimationFinish)
            });
        });
    };

    const handleAnimationFinish = () => {
        // Step 1: Transform text to ash (fade to gray, shrink, fade out)
        Animated.parallel([
            Animated.timing(textColorAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false, // Color interpolation needs native driver false
            }),
            Animated.timing(textScaleAnim, {
                toValue: 0.3,
                duration: 2000,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(800),
                Animated.timing(textFadeAnim, {
                    toValue: 0,
                    duration: 1200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            // Step 2: Stop glow animation
            glowAnim.stopAnimation();

            // Step 3: Fade out note
            Animated.parallel([
                Animated.timing(noteOpacity, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(noteScale, {
                    toValue: 0.5,
                    duration: 1000,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Step 4: Show comfort message
                setComfortMessageVisible(true);
                Animated.timing(comfortMessageAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.out(Easing.back(1.1)),
                    useNativeDriver: true,
                }).start();

                // Reset states after a delay
                setTimeout(() => {
                    setIsBurning(false);
                    setHasBurned(true);
                }, 500);
            });
        });
    };

    const handleBurn = () => {
        if (!thought.trim()) {
            // Shake animation for validation
            Animated.sequence([
                Animated.timing(shakeAnim, {
                    toValue: 10,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: -10,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 10,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 0,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]).start();
            return;
        }

        setIsBurning(true);
    };

    const handleReset = () => {
        // Reset all animations and states
        setThought('');
        setIsBurning(false);
        setHasBurned(false);
        setComfortMessageVisible(false);
        
        // Reset animation values
        fadeAnim.setValue(1);
        scaleAnim.setValue(1);
        noteOpacity.setValue(0);
        noteScale.setValue(0.8);
        textFadeAnim.setValue(1);
        textScaleAnim.setValue(1);
        textColorAnim.setValue(0);
        glowAnim.setValue(0.3);
        comfortMessageAnim.setValue(0);
        shakeAnim.setValue(0);
        
        // Reset Lottie
        lottieRef.current?.reset();
        lottieRef2.current?.reset();
        lottieRef3.current?.reset();
    };

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 0.3, 0.8, 1],
        outputRange: [0, 0.2, 0.5, 0.2],
    });

    const translateX = shakeAnim;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 100 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Düşünceyi Yak</Text>
                </View>

                {/* Explanatory Text */}
                <View style={styles.explanationContainer}>
                    <Text style={styles.explanationText}>
                        İçinden atmak istediğin olumsuz düşünceyi yaz ve sembolik olarak yak. 
                        Bu ritüel, düşüncenin seni terk etmesine yardımcı olacak.
                    </Text>
                </View>

                {/* Input Section */}
                <Animated.View
                    style={[
                        styles.inputSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }, { translateX }],
                        },
                    ]}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="İçinden atmak istediğin düşünceyi yaz..."
                        placeholderTextColor={COLORS.SECOND + '80'}
                        value={thought}
                        onChangeText={setThought}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        editable={!isBurning && !hasBurned}
                    />
                </Animated.View>

                {/* Button */}
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}>
                    <Button
                        title={isBurning ? 'Yakılıyor...' : 'Yak ve Bırak'}
                        onPress={handleBurn}
                        disabled={isBurning || hasBurned}
                        style={styles.burnButton}
                    />
                </Animated.View>

                {/* Note Card with Text (shown during burning) */}
                {isBurning && (
                    <View style={styles.noteContainer}>
                        <Animated.View
                            style={[
                                styles.noteCard,
                                {
                                    opacity: noteOpacity,
                                    transform: [{ scale: noteScale }],
                                },
                            ]}>
                            {/* Note background - simple paper style */}
                            <View style={styles.noteBackground}>
                                {/* Text on note */}
                                <Animated.View
                                    style={[
                                        styles.noteTextContainer,
                                        {
                                            opacity: textFadeAnim,
                                            transform: [{ scale: textScaleAnim }],
                                        },
                                    ]}>
                                    <Animated.Text
                                        style={[
                                            styles.noteText,
                                            {
                                                color: textColorAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['#3E2723', '#757575'], // Dark brown to gray (ash)
                                                }),
                                            },
                                        ]}>
                                        {thought}
                                    </Animated.Text>
                                </Animated.View>
                            </View>

                            {/* Lottie burning animation */}
                            <View style={styles.lottieContainer}>
                                <LottieView
                                    ref={lottieRef}
                                    source={burnAnimation}
                                    autoPlay={false}
                                    loop={false}
                                    style={styles.lottie}
                                    onAnimationFinish={handleAnimationFinish}
                                />
                                <LottieView
                                    ref={lottieRef2}
                                    source={burnAnimation}
                                    autoPlay={false}
                                    loop={false}
                                    style={[styles.lottie, { transform: [{ scaleX: -1 }] }]}
                                />
                                <LottieView
                                    ref={lottieRef3}
                                    source={burnAnimation}
                                    autoPlay={false}
                                    loop={false}
                                    style={styles.lottie}
                                />
                            </View>
                        </Animated.View>
                    </View>
                )}

                {/* Comfort Message */}
                {comfortMessageVisible && (
                    <Animated.View
                        style={[
                            styles.comfortContainer,
                            {
                                opacity: comfortMessageAnim,
                                transform: [
                                    {
                                        scale: comfortMessageAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.9, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <Text style={styles.comfortIcon}>✨</Text>
                        <Text style={styles.comfortTitle}>
                            Bıraktığın düşünce artık senden uzaklaştı.
                        </Text>
                        <Text style={styles.comfortSubtitle}>
                            Derin bir nefes al.
                        </Text>
                    </Animated.View>
                )}

                {/* Reset Button (shown after burning) */}
                {hasBurned && !isBurning && (
                    <View style={styles.resetContainer}>
                        <Button
                            title="Başka bir düşünce yak"
                            onPress={handleReset}
                            variant="outline"
                            style={styles.resetButton}
                        />
                    </View>
                )}
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
    scrollContent: {
        padding: 24,
        paddingTop: 20,
        maxWidth: 430,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.SECOND,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.SECOND,
        flex: 1,
    },
    explanationContainer: {
        marginBottom: 32,
        padding: 20,
        backgroundColor: '#27192c',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.2)',
    },
    explanationText: {
        fontSize: 16,
        color: COLORS.SECOND,
        lineHeight: 24,
        textAlign: 'center',
    },
    inputSection: {
        marginBottom: 24,
    },
    textInput: {
        backgroundColor: '#27192c',
        borderRadius: 16,
        padding: 20,
        minHeight: 150,
        fontSize: 16,
        color: COLORS.SECOND,
        borderWidth: 1,
        borderColor: 'rgba(224, 195, 108, 0.2)',
        fontFamily: 'RedHatDisplay-Regular',
    },
    buttonContainer: {
        marginBottom: 24,
    },
    burnButton: {
        width: '100%',
    },
    noteContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
    },
    noteCard: {
        width: '85%',
        maxWidth: 350,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteBackground: {
        width: '100%',
        backgroundColor: '#F5E6D3', // Beige/sand paper color
        borderRadius: 4,
        padding: 32,
        borderWidth: 1,
        borderColor: '#E8D5B7', // Slightly darker beige for border
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    noteTextContainer: {
        width: '100%',
        zIndex: 10,
    },
    noteText: {
        fontSize: 18,
        color: '#3E2723', // Dark brown text color (like ink on paper)
        lineHeight: 28,
        textAlign: 'center',
        fontWeight: '400',
    },
    lottieContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
        width: '100%',
    },
    lottie: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    comfortContainer: {
        alignItems: 'center',
        padding: 32,
        marginTop: -250,
        marginBottom: 24,
        position: 'relative',
        zIndex: 2000,
    },
    comfortIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    comfortTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.MAIN,
        textAlign: 'center',
        marginBottom: 8,
    },
    comfortSubtitle: {
        fontSize: 18,
        color: COLORS.SECOND,
        textAlign: 'center',
    },
    resetContainer: {
        marginTop: 24,
    },
    resetButton: {
        width: '100%',
    },
});

export default BurnThoughtScreen;

