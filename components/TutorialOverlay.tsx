import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { TUTORIAL_STEPS } from '../constants/game-data';

export function TutorialOverlay() {
    const { tutStep, activeScreen, actions } = useGameStore(state => state);

    if (tutStep >= TUTORIAL_STEPS.length) return null;

    const step = TUTORIAL_STEPS[tutStep];

    // Only show overlay if we are on the correct screen
    if (step.screen && step.screen !== activeScreen) {
         if (step.target !== 'nav_zep' && step.target !== 'btn_back') return null;
    }

    const isInfoStep = step.target === null || step.id === 0 || step.id === 1;

    return (
        <View style={styles.container} pointerEvents="box-none">
            {isInfoStep && (
                <TouchableOpacity
                    style={styles.infoOverlay}
                    activeOpacity={1}
                    onPress={() => actions.advanceTutorial()}
                />
            )}
            <View style={styles.tutorialBox} pointerEvents="none">
                <Text style={styles.text}>{step.text}</Text>
                {isInfoStep && <Text style={styles.subText}>(Toque para continuar)</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    tutorialBox: {
        marginHorizontal: 20,
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
