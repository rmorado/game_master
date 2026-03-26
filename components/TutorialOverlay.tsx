import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { TUTORIAL_STEPS } from '../constants/game-data';

export function TutorialOverlay() {
    const { tutStep, activeApp, actions } = useGameStore(state => state);

    if (tutStep >= TUTORIAL_STEPS.length) return null;

    const step = TUTORIAL_STEPS[tutStep];

    // btn_back: ChatScreen handles its own highlighting — no overlay needed
    if (step.target === 'btn_back') return null;

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
                <View style={styles.tutorialBox}>
                    <Text style={styles.text}>{step.text}</Text>
                    <Text style={styles.subText}>(Toque para continuar)</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // Non-info steps: floating text box anchored to bottom, passes all touches through
    return (
        <View style={styles.floatingContainer} pointerEvents="none">
            <View style={styles.tutorialBox}>
                <Text style={styles.text}>{step.text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    infoContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingContainer: {
        position: 'absolute',
        top: 70,
        left: 20,
        right: 20,
        zIndex: 9999,
        alignItems: 'center',
    },
    tutorialBox: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white',
    },
    text: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    subText: {
        color: '#888',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    }
});
