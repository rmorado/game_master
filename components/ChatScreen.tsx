// components/ChatScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { STORY } from '../constants/game-data';

export function ChatScreen() {
    const { actions, messages, currentChat, levelIdx } = useGameStore(state => state);

    const goBack = () => {
        actions.setActiveScreen('zep');
    }

    const contact = STORY.find(c => c.contact === currentChat);
    
    const renderActions = () => {
        if (currentChat === 'hacker') {
            return (
                <>
                    <TouchableOpacity style={styles.presetBtn} onPress={() => actions.buyCpf(false, 10)}>
                        <Text style={styles.presetBtnText}>10 CPFs (-50k)</Text>
                    </TouchableOpacity>
                    {levelIdx >= 1 && (
                        <TouchableOpacity style={styles.presetBtn} onPress={() => actions.buyCpf(false, 50)}>
                            <Text style={styles.presetBtnText}>50 CPFs (-250k)</Text>
                        </TouchableOpacity>
                    )}
                    {levelIdx >= 2 && (
                        <TouchableOpacity style={styles.presetBtn} onPress={() => actions.buyCpf(false, 100)}>
                            <Text style={styles.presetBtnText}>100 CPFs (-500k)</Text>
                        </TouchableOpacity>
                    )}
                </>
            );
        }
        // Add actions for other contacts here
        return null;
    }

    return (
        <View style={styles.chatView}>
            <View style={styles.chatHeader}>
                <TouchableOpacity onPress={goBack}>
                    <Text style={{fontSize:24, color:'white'}}>←</Text>
                </TouchableOpacity>
                <Image source={{ uri: contact?.avatar }} style={styles.avatar} />
                <Text style={{fontWeight:'bold', color: 'white'}}>{contact?.name}</Text>
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
    }
});
