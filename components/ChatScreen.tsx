// components/ChatScreen.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { getCharacter, DIALOGUES, UI_CHAT } from '../constants/dialogues';

export function ChatScreen() {
    const state = useGameStore(s => s);
    const { actions, chatHistory, currentChat, tutStep, hasPendingBag, hasUsedNotNow, isTyping, unlockedDialogueOptions } = state;
    const flatListRef = useRef<FlatList>(null);

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
    }, [displayMessages, isTyping]);

    // Tutorial logic
    const isTutorial = tutStep < 8;
    const shouldHighlightBuy100 = tutStep === 4;

    const renderActions = () => {
        // Drugdealer pending bag — show offer response buttons
        if (currentChat === 'drugdealer' && hasPendingBag) {
            if (hasUsedNotNow) {
                return (
                    <TouchableOpacity
                        style={[styles.presetBtn, styles.presetBtnAccept]}
                        onPress={() => actions.respondToBag(true)}
                    >
                        <Text style={styles.presetBtnText}>{UI_CHAT.bagAcceptLater}</Text>
                    </TouchableOpacity>
                );
            }
            return (
                <>
                    <TouchableOpacity
                        style={[styles.presetBtn, styles.presetBtnAccept]}
                        onPress={() => actions.respondToBag(true)}
                    >
                        <Text style={styles.presetBtnText}>{UI_CHAT.bagAccept}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.presetBtn}
                        onPress={() => actions.respondToBag(false)}
                    >
                        <Text style={[styles.presetBtnText, { color: '#aaa' }]}>{UI_CHAT.bagDecline}</Text>
                    </TouchableOpacity>
                </>
            );
        }

        // Get dialogue options for current character
        const dialogue = DIALOGUES[currentChat!];
        if (!dialogue) return null;

        const visibleOptions = dialogue.outgoingOptions.filter(option => {
            if (option.requiresUnlock && !unlockedDialogueOptions.includes(option.id)) return false;
            const visCheck = option.showCondition || option.condition;
            if (visCheck && !visCheck(state)) return false;
            return true;
        });

        return (
            <>
                {visibleOptions.map(option => {
                    const canUse = !option.condition || option.condition(state);
                    const isHighlighted = shouldHighlightBuy100 && option.id === 'buy_100_cpfs';
                    const isDisabled = (!canUse) || (isTutorial && !isHighlighted);
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
                <TouchableOpacity onPress={() => actions.setActiveApp('zep')}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Image source={character?.avatar} style={styles.avatar} />
                <Text style={styles.headerName}>{character?.name}</Text>
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
                ListFooterComponent={isTyping ? (
                    <View style={styles.bubble}>
                        <Text style={styles.bubbleText}>...</Text>
                    </View>
                ) : null}
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
        gap: 8,
        borderBottomWidth: 1,
        borderColor: '#333',
    },
    backArrow: {
        color: '#aaa',
        fontSize: 28,
        lineHeight: 32,
        paddingRight: 2,
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: '#333',
    },
    headerName: {
        fontWeight: 'bold',
        color: 'white',
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
    highlighted: {
        backgroundColor: 'rgba(0, 255, 65, 0.1)',
        borderColor: '#00ff41',
        borderWidth: 2,
    },
    disabled: {
        opacity: 0.3,
    },
});
