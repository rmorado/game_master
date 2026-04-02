import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFonts, JetBrainsMono_400Regular, JetBrainsMono_400Regular_Italic } from '@expo-google-fonts/jetbrains-mono';
import { useShallow } from 'zustand/react/shallow';
import { TUTORIAL } from '../constants/dialogues';
import { useGameStore } from '../hooks/use-game-store';
import { useStrings } from '../constants/strings';
import { resolveBi } from '../utils/dialogue';

export function TutorialOverlay() {
    useFonts({ JetBrainsMono_400Regular, JetBrainsMono_400Regular_Italic });

    const { tutStep, activeApp, language, actions } = useGameStore(useShallow(s => ({
        tutStep: s.tutStep,
        activeApp: s.activeApp,
        language: s.language,
        actions: s.actions,
    })));
    const s = useStrings();

    const skipBtn = (
        <TouchableOpacity style={styles.skipBtn} onPress={() => actions.skipTutorial()}>
            <Text style={styles.skipText}>pular tutorial</Text>
        </TouchableOpacity>
    );

    if (tutStep >= TUTORIAL.length) return null;

    const step = TUTORIAL[tutStep];

    // Only show overlay if we are on the correct screen
    if (step.screen && step.screen !== activeApp) {
        if (step.target !== 'nav_zep') return null;
    }

    const isInfoStep = step.target === null || step.id === 0 || step.id === 1;

    // Info steps (tap-to-continue): use full-screen overlay with dim backdrop
    if (isInfoStep) {
        return (
            <TouchableOpacity
                style={styles.infoContainer}
                activeOpacity={1}
                onPress={() => actions.advanceTutorial()}
            >
                <View style={[styles.tutorialBox, styles.infoBox]}>
                    <Text style={styles.text}>{resolveBi(step.text, language)}</Text>
                    <Text style={styles.subText}>{s.tutorial.tapToContinue}</Text>
                </View>
                {skipBtn}
            </TouchableOpacity>
        );
    }

    // Non-info steps: floating text box at per-step position, passes all touches through
    const pos = step.boxPosition ?? { bottom: 170 };
    return (
        <View style={[styles.floatingContainer, pos]} pointerEvents="box-none">
            <View style={styles.tutorialBox}>
                <Text style={styles.text}>{resolveBi(step.text, language)}</Text>
            </View>
            {skipBtn}
        </View>
    );
}

const styles = StyleSheet.create({
    infoContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 9999,
        alignItems: 'center',
    },
    infoBox: {
        backgroundColor: 'transparent',
    },
    tutorialBox: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white',
    },
    text: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'JetBrainsMono_400Regular',
    },
    subText: {
        color: '#888',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
        fontFamily: 'JetBrainsMono_400Regular_Italic',
    },
    skipBtn: {
        marginTop: 16,
        padding: 8,
    },
    skipText: {
        color: '#555',
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'JetBrainsMono_400Regular_Italic',
    },
});
