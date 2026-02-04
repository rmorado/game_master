// components/ZepScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';

export function ZepScreen() {
    const { contacts, actions } = useGameStore(state => ({ 
        contacts: state.contacts,
        actions: state.actions 
    }));

    const startChat = (contactId: string) => {
        actions.chat(contactId);
    }

    const contactList = Object.entries(contacts)
        .filter(([, isActive]) => isActive)
        .map(([key]) => {
            // In a real app, you'd fetch this data from a constants file
            if (key === 'hacker') return { id: 'hacker', name: 'H4CK3R', sub: 'Venda de Dados', img: 'hacker.png', border: '#0f0' };
            if (key === 'judge') return { id: 'judge', name: 'Dr. Gilmar', sub: 'Jurídico', img: 'judge.png', border: 'gold' };
            if (key === 'deputy') return { id: 'deputy', name: 'Dep. Motta', sub: 'Campanha', img: 'https://placehold.co/50/444/FFF?text=DM', border: 'cyan' };
            return null;
        }).filter(Boolean);

    return (
        <View style={styles.container}>
            <View style={styles.statusBar}>
                <Text style={styles.appName}>Zep</Text>
            </View>
            <FlatList
                data={contactList}
                keyExtractor={(item) => item!.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => startChat(item!.id)}>
                        <View style={styles.zepItem}>
                            {/* Image component would go here */}
                            <View style={[styles.avatar, { borderColor: item!.border }]} />
                            <View style={styles.zepInfo}>
                                <Text style={styles.zepName}>{item!.name}</Text>
                                <Text style={styles.zepSub}>{item!.sub}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
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
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#333',
        marginRight: 15,
        borderWidth: 2,
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
});
