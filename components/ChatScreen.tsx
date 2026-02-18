// components/ChatScreen.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { getCharacter, DIALOGUES } from '../constants/dialogues';

export function ChatScreen() {
    const state = useGameStore(s => s);
    const { actions, chatHistory, currentChat, levelIdx, tutStep, cpfsBoughtFromHacker, hasUnlocked50Pack, hasPendingBag, hasUsedNotNow } = state;
    const flatListRef = useRef<FlatList>(null);

    const goBack = () => {
        actions.setActiveScreen('zep');
    }

    const character = currentChat ? getCharacter(currentChat) : undefined;

    // Read messages from per-contact chat history
    const displayMessages = (currentChat && chatHistory[currentChat]) || [];

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (displayMessages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [displayMessages]);

    // Tutorial logic
    const isTutorial = tutStep < 8;
    const shouldHighlightBuy10 = tutStep === 4;
    const shouldHighlightBack = tutStep === 5;

    const renderActions = () => {
        // Drugdealer pending bag — show offer response buttons
        if (currentChat === 'drugdealer' && hasPendingBag) {
            return (
                <>
                    <TouchableOpacity
                        style={[styles.presetBtn, styles.presetBtnAccept]}
                        onPress={() => actions.respondToBag(true)}
                    >
                        <Text style={styles.presetBtnText}>OK, manda.</Text>
                    </TouchableOpacity>
                    {!hasUsedNotNow && (
                        <TouchableOpacity
                            style={styles.presetBtn}
                            onPress={() => actions.respondToBag(false)}
                        >
                            <Text style={[styles.presetBtnText, { color: '#aaa' }]}>Não agora.</Text>
                        </TouchableOpacity>
                    )}
                </>
            );
        }

        // Get dialogue options for current character
        const dialogue = DIALOGUES[currentChat!];
        if (!dialogue) return null;

        // Filter available options based on conditions
        const availableOptions = dialogue.outgoingOptions.filter(option => {
            if (option.condition && !option.condition(state)) return false;
            return true;
        });

        return (
            <>
                {availableOptions.map(option => {
                    const isHighlighted = shouldHighlightBuy10 && option.id === 'buy_10_cpfs';
                    const isDisabled = isTutorial && !isHighlighted;
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.presetBtn,
                                isHighlighted && styles.highlighted,
                                isDisabled && styles.disabled
                            ]}
                            onPress={() => actions.chooseDialogueOption(option.id)}
                            disabled={isDisabled}
                        >
                            <Text style={styles.presetBtnText}>{option.text}</Text>
                        </TouchableOpacity>
                    );
                })}
            </>
        );
    }

    return (
        <View style={styles.chatView}>
            <View style={styles.chatHeader}>
                <TouchableOpacity
                    onPress={goBack}
                    style={[
                        styles.backButton,
                        shouldHighlightBack && styles.highlightedBack
                    ]}
                    disabled={isTutorial && !shouldHighlightBack}
                >
                    <Text style={{fontSize:24, color:'white'}}>←</Text>
                </TouchableOpacity>
                <Image source={character?.avatar} style={styles.avatar} />
                <Text style={{fontWeight:'bold', color: 'white'}}>{character?.name}</Text>
            </View>
            <FlatList
                ref={flatListRef}
                style={styles.chatMsgs}
                data={displayMessages}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                    <View style={[styles.bubble, item.me && styles.me]}>
                        <Text style={styles.bubbleText}>{item.text}</Text>
                    </View>
                )}
            />
            <View style={styles.chatActions}>
                {renderActions()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chatView: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#0b141a',
        width: '100%',
    },
    chatHeader: {
        padding: 10,
        backgroundColor: '#202c33',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderBottomWidth: 1,
        borderColor: '#333',
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: '#333',
    },
    chatMsgs: {
        flex: 1,
        padding: 20,
    },
    bubble: {
        backgroundColor: '#202c33',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        maxWidth: '80%',
        marginBottom: 10,
    },
    me: {
        backgroundColor: '#005c4b',
        alignSelf: 'flex-end',
    },
    bubbleText: {
        color: '#e9edef',
        fontSize: 14,
        lineHeight: 20,
    },
    chatActions: {
        padding: 15,
        backgroundColor: '#202c33',
    },
    presetBtn: {
        padding: 15,
        backgroundColor: '#1f2c34',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 10,
    },
    presetBtnText: {
        color: '#00ff41',
        fontWeight: '600',
        textAlign: 'left',
    },
    presetBtnAccept: {
        borderColor: '#00ff41',
        backgroundColor: 'rgba(0,255,65,0.08)',
    },
    backButton: {
        padding: 5,
    },
    highlightedBack: {
        backgroundColor: 'rgba(0, 255, 65, 0.2)',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#00ff41',
    },
    highlighted: {
        backgroundColor: 'rgba(0, 255, 65, 0.1)',
        borderColor: '#00ff41',
        borderWidth: 2,
    },
    disabled: {
        opacity: 0.3,
    },
});
