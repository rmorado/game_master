// components/LevelUpScreen.tsx
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { LEVEL_EVENTS } from '../constants/dialogues';
import { CHARACTERS } from '../constants/dialogues';

export function LevelUpScreen() {
    const levelUpScreen = useGameStore(s => s.levelUpScreen);
    const dialogueIdx = useGameStore(s => s.levelUpDialogueIdx);
    const advanceLevelDialogue = useGameStore(s => s.actions.advanceLevelDialogue);

    const event = levelUpScreen !== null ? LEVEL_EVENTS[levelUpScreen] : null;

    // No event defined — auto-dismiss (must be in useEffect, not during render)
    useEffect(() => {
        if (levelUpScreen !== null && !event) {
            advanceLevelDialogue();
        }
    }, [levelUpScreen, event, advanceLevelDialogue]);

    if (levelUpScreen === null || !event) return null;

    const hasDialogues = event.dialogues.length > 0;
    const currentDialogue = hasDialogues ? event.dialogues[dialogueIdx] : null;
    const character = currentDialogue?.from && currentDialogue.from !== 'system'
        ? (CHARACTERS as any)[currentDialogue.from]
        : null;

    return (
        <View style={styles.container}>
            <View style={styles.titleBox}>
                <Text style={styles.titleLabel}>NÍVEL</Text>
                <Text style={styles.title}>{event.title}</Text>
                {event.subtitle && (
                    <Text style={styles.subtitle}>{event.subtitle}</Text>
                )}
            </View>

            {currentDialogue && (
                <View style={styles.dialogueBox}>
                    {character && (
                        <View style={styles.characterRow}>
                            {character.avatar && (
                                <Image source={character.avatar} style={styles.avatar} />
                            )}
                            <Text style={styles.characterName}>{character.name}</Text>
                        </View>
                    )}
                    <Text style={styles.dialogueText}>{currentDialogue.text}</Text>
                </View>
            )}

            <TouchableOpacity style={styles.tapArea} onPress={advanceLevelDialogue}>
                <Text style={styles.tapHint}>
                    {hasDialogues && dialogueIdx < event.dialogues.length - 1
                        ? 'TOQUE PARA CONTINUAR'
                        : 'TOQUE PARA JOGAR'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        zIndex: 100,
    },
    titleBox: {
        alignItems: 'center',
        marginBottom: 40,
    },
    titleLabel: {
        color: '#666',
        fontSize: 14,
        letterSpacing: 4,
        marginBottom: 8,
    },
    title: {
        color: '#D4AF37',
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
        marginTop: 10,
    },
    dialogueBox: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        marginBottom: 30,
    },
    characterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    characterName: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
    },
    dialogueText: {
        color: '#ccc',
        fontSize: 16,
        lineHeight: 24,
    },
    tapArea: {
        position: 'absolute',
        bottom: 60,
    },
    tapHint: {
        color: '#555',
        fontSize: 12,
        letterSpacing: 3,
    },
});
