// components/LevelUpScreen.tsx
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { LEVEL_EVENTS, CHARACTERS } from '../constants/dialogues';
import { useStrings } from '../constants/strings';
import { resolveBi } from '../utils/dialogue';

export function LevelUpScreen() {
    const { levelUpScreen, levelUpDialogueIdx: dialogueIdx, language, actions } = useGameStore(useShallow(s => ({
        levelUpScreen: s.levelUpScreen,
        levelUpDialogueIdx: s.levelUpDialogueIdx,
        language: s.language,
        actions: s.actions,
    })));
    const str = useStrings();
    const { advanceLevelDialogue } = actions;

    const event = levelUpScreen !== null ? LEVEL_EVENTS[levelUpScreen] : null;

    // No event defined — auto-dismiss (must be in useEffect, not during render)
    useEffect(() => {
        if (levelUpScreen !== null && !event) {
            advanceLevelDialogue();
        }
    }, [levelUpScreen, event, advanceLevelDialogue]);

    if (levelUpScreen === null || !event) return null;

    // dialogueIdx starts at -1 (title only), then 0..n for each dialogue line
    const showingTitle = dialogueIdx < 0;
    const currentDialogue = !showingTitle && dialogueIdx < event.dialogues.length
        ? event.dialogues[dialogueIdx]
        : null;
    const character = currentDialogue?.from && currentDialogue.from !== 'system'
        ? (CHARACTERS as any)[currentDialogue.from]
        : null;

    const isLastStep = !showingTitle && dialogueIdx >= event.dialogues.length - 1;

    return (
        <TouchableOpacity style={styles.container} activeOpacity={1} onPress={advanceLevelDialogue}>
            <View style={styles.titleBox}>
                <Text style={styles.titleLabel}>{str.levelUp.label}</Text>
                <Text style={styles.title}>{resolveBi(event.title, language)}</Text>
                {event.subtitle && (
                    <Text style={styles.subtitle}>{resolveBi(event.subtitle, language)}</Text>
                )}
            </View>

            {currentDialogue && (
                <View style={styles.dialogueBox}>
                    {character && (
                        <View style={styles.characterRow}>
                            {character.avatar && (
                                <Image source={character.avatar} style={styles.avatar} />
                            )}
                            <Text style={styles.characterName}>{resolveBi(character.name, language)}</Text>
                        </View>
                    )}
                    <Text style={styles.dialogueText}>{resolveBi(currentDialogue.text, language)}</Text>
                </View>
            )}

            <View style={styles.tapArea}>
                <Text style={styles.tapHint}>
                    {isLastStep || event.dialogues.length === 0
                        ? str.levelUp.tapToPlay
                        : str.levelUp.tapToContinue}
                </Text>
            </View>
        </TouchableOpacity>
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
