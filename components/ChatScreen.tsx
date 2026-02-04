// components/ChatScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { getCharacter } from '../constants/dialogues';

export function ChatScreen() {
    const { actions, messages, currentChat, levelIdx, tutStep } = useGameStore(state => state);

    const goBack = () => {
        actions.setActiveScreen('zep');
    }

    const character = getCharacter(currentChat);

    // Tutorial logic
    const isTutorial = tutStep < 8;
    const shouldHighlightBuy10 = tutStep === 4;
    const shouldHighlightBack = tutStep === 5;

    const renderActions = () => {
        if (currentChat === 'hacker' && character?.offers) {
            return (
                <>
                    {character.offers.map(offer => {
                        const isHighlighted = shouldHighlightBuy10 && offer.qty === 10;
                        const isDisabled = isTutorial && !isHighlighted;
                        return (
                            levelIdx >= offer.minLevel && (
                                <TouchableOpacity
                                    key={offer.qty}
                                    style={[
                                        styles.presetBtn,
                                        isHighlighted && styles.highlighted,
                                        isDisabled && styles.disabled
                                    ]}
                                    onPress={() => actions.buyCpf(false, offer.qty)}
                                    disabled={isDisabled}
                                >
                                    <Text style={styles.presetBtnText}>{offer.label}</Text>
                                </TouchableOpacity>
                            )
                        );
                    })}
                </>
            );
        }
        // Add actions for other contacts here
        return null;
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
                <Image source={{ uri: character?.avatar }} style={styles.avatar} />
                <Text style={{fontWeight:'bold', color: 'white'}}>{character?.name}</Text>
            </View>
            <FlatList
                style={styles.chatMsgs}
                data={messages}
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
