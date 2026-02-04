// components/NavBar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';

export function NavBar() {
    const { activeScreen, actions } = useGameStore(state => ({
        activeScreen: state.activeScreen,
        actions: state.actions,
    }));

    const setScreen = (screen: 'bank' | 'zep') => {
        actions.setActiveScreen(screen); 
    }

    return (
        <View style={styles.navBar}>
            <TouchableOpacity 
                style={[styles.navItem, activeScreen === 'bank' && styles.active]}
                onPress={() => setScreen('bank')}
            >
                <Text style={styles.navIcon}>🏛️</Text>
                <Text style={[styles.navText, activeScreen === 'bank' && styles.activeText]}>BANCO</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.navItem, activeScreen === 'zep' && styles.active]}
                onPress={() => setScreen('zep')}
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
});
