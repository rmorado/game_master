// components/NewMessagePopup.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';

export function NewMessagePopup() {
    const { showNewMessagePopup, actions } = useGameStore(state => ({
        showNewMessagePopup: state.showNewMessagePopup,
        actions: state.actions
    }));

    if (!showNewMessagePopup) return null;

    return (
        <TouchableOpacity
            style={styles.popup}
            onPress={() => actions.dismissNewMessagePopup()}
            activeOpacity={0.9}
        >
            <View style={styles.popupContent}>
                <Text style={styles.popupText}>💰 NOVA MENSAGEM</Text>
                <Text style={styles.popupSubtext}>Toque para dispensar</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    popup: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 10000,
        backgroundColor: '#005c4b',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    popupContent: {
        alignItems: 'center',
    },
    popupText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    popupSubtext: {
        color: '#ccc',
        fontSize: 12,
    },
});
