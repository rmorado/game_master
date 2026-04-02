// components/NewMessagePopup.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { getCharacter } from '../constants/dialogues';
import { resolveBi } from '../utils/dialogue';

export function NewMessagePopup() {
    const { showNewMessagePopup, popupSender, popupPreview, language, actions } = useGameStore(useShallow(state => ({
        showNewMessagePopup: state.showNewMessagePopup,
        popupSender: state.popupSender,
        popupPreview: state.popupPreview,
        language: state.language,
        actions: state.actions,
    })));

    if (!showNewMessagePopup) return null;

    const character = popupSender ? getCharacter(popupSender) : undefined;
    const name = character?.name ? resolveBi(character.name, language) : 'ZEP';

    return (
        <TouchableOpacity
            style={styles.popup}
            onPress={() => actions.dismissNewMessagePopup()}
            activeOpacity={0.9}
        >
            {character?.avatar && (
                <Image source={character.avatar} style={styles.avatar} />
            )}
            <View style={styles.textWrap}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.preview} numberOfLines={1}>{popupPreview}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    popup: {
        position: 'absolute',
        top: 54,
        left: 12,
        right: 12,
        zIndex: 10000,
        backgroundColor: '#1a2e23',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#333',
    },
    textWrap: {
        flex: 1,
    },
    name: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    preview: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 12,
        marginTop: 1,
    },
});
