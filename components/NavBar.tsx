// components/NavBar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';

export function NavBar() {
    const { activeScreen, tutStep, actions } = useGameStore(state => ({
        activeScreen: state.activeScreen,
        tutStep: state.tutStep,
        actions: state.actions,
    }));

    const setScreen = (screen: 'bank' | 'zep') => {
        actions.setActiveScreen(screen);
    }

    // Tutorial logic
    const isTutorial = tutStep < 8;
    const shouldHighlightZep = tutStep === 2;
    const shouldHighlightBank = tutStep === 5;
    const shouldDisableBanco = isTutorial && tutStep !== 5;
    const shouldDisableZep = isTutorial && tutStep !== 2;

    return (
        <View style={styles.navBar}>
            <TouchableOpacity
                style={[
                    styles.navItem,
                    activeScreen === 'bank' && styles.active,
                    shouldHighlightBank && styles.highlighted,
                    shouldDisableBanco && styles.disabled
                ]}
                onPress={() => setScreen('bank')}
                disabled={shouldDisableBanco}
            >
                <Text style={styles.navIcon}>🏛️</Text>
                <Text style={[styles.navText, activeScreen === 'bank' && styles.activeText]}>BANCO</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.navItem,
                    activeScreen === 'zep' && styles.active,
                    shouldHighlightZep && styles.highlighted,
                    shouldDisableZep && styles.disabled
                ]}
                onPress={() => setScreen('zep')}
                disabled={shouldDisableZep}
            >
                <Text style={styles.navIcon}>💬</Text>
                <Text style={[styles.navText, activeScreen === 'zep' && styles.activeText]}>ZEP</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    navBar: {
        height: 65,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderColor: '#333',
        display: 'flex',
        flexDirection: 'row',
    },
    navItem: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    active: {
        // Special style for active tab if needed
    },
    navIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    navText: {
        fontSize: 10,
        color: '#555',
    },
    activeText: {
        color: '#D4AF37',
    },
    highlighted: {
        backgroundColor: 'rgba(0, 255, 65, 0.2)',
        borderTopWidth: 3,
        borderTopColor: '#00ff41',
    },
    disabled: {
        opacity: 0.3,
    },
});
