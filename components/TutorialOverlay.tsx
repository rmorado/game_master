import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { TUTORIAL_STEPS } from '../constants/game-data';

const { width, height } = Dimensions.get('window');

export function TutorialOverlay() {
    const { tutStep, activeScreen, actions } = useGameStore(state => state);

    if (tutStep >= TUTORIAL_STEPS.length) return null;

    const step = TUTORIAL_STEPS[tutStep];

    // Only show overlay if we are on the correct screen
    if (step.screen && step.screen !== activeScreen) {
         if (step.target !== 'nav_zep' && step.target !== 'btn_back') return null; 
    }

    const getPosition = (target: string | null) => {
        switch(target) {
            case 'dirty_display': return { top: 220, left: 20 };
            case 'nav_zep': return { bottom: 100, alignSelf: 'center' };
            case 'contact_hacker': return { top: 150, left: 20 };
            case 'btn_buy_10': return { bottom: 150, left: 20 };
            case 'btn_back': return { top: 60, left: 20 };
            case 'btn_loan': return { bottom: 120, left: 20 };
            case 'clean_display': return { top: 280, left: 20 };
            default: return { top: height / 2 - 50, alignSelf: 'center' };
        }
    }

    const pos = getPosition(step.target);
    const isInfoStep = step.target === null || step.id === 0 || step.id === 1 || step.id === 7;

    return (
        <View style={styles.overlay} pointerEvents={isInfoStep ? 'auto' : 'none'}>
             {isInfoStep ? (
                <TouchableOpacity style={styles.touchableArea} onPress={() => actions.advanceTutorial()}>
                    <View style={[styles.highlight, pos]}>
                        <Text style={styles.arrow}>⬇</Text>
                        <View style={styles.box}>
                            <Text style={styles.text}>{step.text}</Text>
                            <Text style={styles.subText}>(Toque para continuar)</Text>
                        </View>
                    </View>
                </TouchableOpacity>
             ) : (
                <View style={[styles.highlight, pos]}>
                    <Text style={styles.arrow}>⬇</Text>
                    <View style={styles.box}>
                        <Text style={styles.text}>{step.text}</Text>
                    </View>
                </View>
             )}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)', 
        zIndex: 9999,
        elevation: 10,
    },
    touchableArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    highlight: {
        position: 'absolute',
        alignItems: 'center',
    },
    arrow: {
        fontSize: 40,
        color: '#00ff41',
        fontWeight: 'bold',
        marginBottom: 10,
        textShadowColor: 'black',
        textShadowRadius: 10,
    },
    box: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#00ff41',
        maxWidth: 300,
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
