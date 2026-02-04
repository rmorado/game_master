// components/StatusBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';

export function StatusBar() {
    const { day } = useGameStore(state => ({ day: state.day }));

    return (
        <View style={styles.statusBar}>
            <Text style={styles.appName}>BANCO MASTER OS</Text>
            <Text style={styles.dayBadge}>DIA {day}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    statusBar: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(20,20,20,0.95)',
        borderBottomWidth: 1,
        borderColor: '#333',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    appName: {
        fontWeight: '900',
        letterSpacing: 1,
        color: '#D4AF37',
        fontSize: 14,
    },
    dayBadge: {
        backgroundColor: '#333',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
        overflow: 'hidden',
    },
});
