// components/ZepScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { getCharacter } from '../constants/dialogues';

export function ZepScreen() {
    const { contacts, tutStep, hasPendingBag, actions } = useGameStore(state => ({
        contacts: state.contacts,
        tutStep: state.tutStep,
        hasPendingBag: state.hasPendingBag,
        actions: state.actions
    }));

    const startChat = (contactId: string) => {
        actions.chat(contactId);
    }

    // Tutorial logic
    const isTutorial = tutStep < 8;
    const shouldHighlightHacker = tutStep === 3;

    const contactList = Object.entries(contacts)
        .filter(([, isActive]) => isActive)
        .map(([key]) => {
            const character = getCharacter(key);
            if (!character) return null;

            // Map character to contact display format
            const subtitles: Record<string, string> = {
                hacker: 'Venda de Dados',
                lawyer: 'Advogado',
                judge: 'Jurídico',
                deputy: 'Campanha'
            };

            const borderColors: Record<string, string> = {
                hacker: '#0f0',
                lawyer: '#ff4500',
                judge: 'gold',
                deputy: 'cyan'
            };

            return {
                id: character.id,
                name: character.name,
                sub: subtitles[key] || 'Contato',
                avatar: character.avatar,
                border: borderColors[key] || '#666'
            };
        }).filter(Boolean);

    return (
        <View style={styles.container}>
            <View style={styles.statusBar}>
                <Text style={styles.appName}>Zep</Text>
            </View>
            <FlatList
                data={contactList}
                keyExtractor={(item) => item!.id}
                renderItem={({ item }) => {
                    const isHighlighted = shouldHighlightHacker && item!.id === 'hacker';
                    const isDisabled = isTutorial && !isHighlighted;
                    return (
                        <TouchableOpacity
                            onPress={() => startChat(item!.id)}
                            disabled={isDisabled}
                        >
                            <View style={[
                                styles.zepItem,
                                isHighlighted && styles.highlighted,
                                isDisabled && styles.disabled
                            ]}>
                                <View style={styles.avatarWrapper}>
                                    <Image
                                        source={item!.avatar}
                                        style={[styles.avatar, { borderColor: item!.border }]}
                                    />
                                    {item!.id === 'drugdealer' && hasPendingBag && (
                                        <View style={styles.pendingDot} />
                                    )}
                                </View>
                                <View style={styles.zepInfo}>
                                    <Text style={styles.zepName}>{item!.name}</Text>
                                    <Text style={styles.zepSub}>{item!.sub}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111b21',
        width: '100%',
    },
    statusBar: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#202c33',
        borderBottomWidth: 1,
        borderColor: '#333',
    },
    appName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    zepItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: '#222',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#333',
        borderWidth: 2,
    },
    pendingDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 13,
        height: 13,
        borderRadius: 6.5,
        backgroundColor: '#ff3b30',
        borderWidth: 2,
        borderColor: '#111b21',
    },
    zepInfo: {
        flex: 1,
    },
    zepName: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 3,
        color: 'white',
    },
    zepSub: {
        fontSize: 13,
        color: '#888',
    },
    highlighted: {
        backgroundColor: 'rgba(0, 255, 65, 0.1)',
        borderLeftWidth: 4,
        borderLeftColor: '#00ff41',
    },
    disabled: {
        opacity: 0.3,
    },
});
