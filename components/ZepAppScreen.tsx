// components/ZepAppScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { getCharacter, UI_ZEP } from '../constants/dialogues';

// Contact order mirrors the mockup
const CONTACT_ORDER = [
    'drugdealer', 'hacker', 'judge', 'deputy', 'lawyer', 'madame', 'anonimo', 'investigador',
];

interface ContactRowProps {
    contactId: string;
    lastMessage: string;
    isMe: boolean;
    unread: number;
    hasPending: boolean;
    onPress: () => void;
    isHighlighted: boolean;
    isDisabled: boolean;
}

function ContactRow({ contactId, lastMessage, isMe, unread, hasPending, onPress, isHighlighted, isDisabled }: ContactRowProps) {
    const char = getCharacter(contactId);
    if (!char) return null;

    const showBadge = (contactId === 'drugdealer' && hasPending) || unread > 0;
    const badgeCount = contactId === 'drugdealer' && hasPending ? '!' : unread > 0 ? String(unread) : '';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            style={[styles.row, isHighlighted && styles.rowHighlight, isDisabled && styles.rowDim]}
            activeOpacity={0.7}
        >
            {/* Avatar */}
            <View style={styles.avatarWrap}>
                <Image
                    source={(char as any).avatar}
                    style={styles.avatar}
                />
                {showBadge && (
                    <View style={styles.activeDot} />
                )}
            </View>

            {/* Info */}
            <View style={styles.info}>
                <View style={styles.topRow}>
                    <Text style={styles.name}>{char.name}</Text>
                    <Text style={styles.time}>{UI_ZEP.timeLabel}</Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={styles.preview} numberOfLines={1}>
                        {isMe && <Text style={styles.checkmarks}>{UI_ZEP.checkmarks}</Text>}
                        {lastMessage}
                    </Text>
                    {showBadge && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{badgeCount}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Separator line */}
            <View style={styles.separator} />
        </TouchableOpacity>
    );
}

export function ZepAppScreen() {
    const { contacts, tutStep, hasPendingBag, unreadCounts, chatHistory, actions } =
        useGameStore(useShallow(s => ({
            contacts: s.contacts,
            tutStep: s.tutStep,
            hasPendingBag: s.hasPendingBag,
            unreadCounts: s.unreadCounts,
            chatHistory: s.chatHistory,
            actions: s.actions,
        })));

    const isTutorial = tutStep < 8;
    const shouldHighlightHacker = tutStep === 3;

    const contactList = CONTACT_ORDER
        .filter(id => contacts[id])
        .map(id => {
            const history = chatHistory[id] || [];
            const last = history[history.length - 1];
            return {
                id,
                lastMessage: last ? last.text : (getCharacter(id) as any)?.sub || '',
                isMe: last?.me ?? false,
                unread: unreadCounts[id] || 0,
            };
        });

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerCenter}>
                    <Text style={styles.wordmark}>{UI_ZEP.wordmark}</Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Text style={styles.iconBtnText}>{UI_ZEP.searchIcon}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Text style={styles.iconBtnText}>{UI_ZEP.menuIcon}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>{UI_ZEP.searchIcon}</Text>
                <Text style={styles.searchPlaceholder}>{UI_ZEP.searchPlaceholder}</Text>
            </View>

            {/* Contact list */}
            <FlatList
                data={contactList}
                keyExtractor={item => item.id}
                style={styles.list}
                renderItem={({ item }) => {
                    const isHighlighted = shouldHighlightHacker && item.id === 'hacker';
                    const isDisabled = isTutorial && !isHighlighted;
                    return (
                        <ContactRow
                            contactId={item.id}
                            lastMessage={item.lastMessage}
                            isMe={item.isMe}
                            unread={item.unread}
                            hasPending={item.id === 'drugdealer' && hasPendingBag}
                            onPress={() => actions.chat(item.id)}
                            isHighlighted={isHighlighted}
                            isDisabled={isDisabled}
                        />
                    );
                }}
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
                <Text style={styles.fabIcon}>{UI_ZEP.fabIcon}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0f0f0f',
    },
    header: {
        backgroundColor: '#111',
        borderBottomWidth: 1,
        borderColor: '#1e1e1e',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 14,
        paddingBottom: 8,
        paddingHorizontal: 12,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    wordmark: {
        fontSize: 22,
        fontWeight: '900',
        color: '#22c55e',
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 2,
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtnText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 20,
    },
    searchBar: {
        margin: 10,
        marginTop: 8,
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
    },
    searchIcon: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 16,
    },
    searchPlaceholder: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 14,
    },
    list: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        position: 'relative',
    },
    rowHighlight: {
        backgroundColor: 'rgba(34,197,94,0.08)',
        borderLeftWidth: 3,
        borderLeftColor: '#22c55e',
    },
    rowDim: {
        opacity: 0.3,
    },
    separator: {
        position: 'absolute',
        bottom: 0,
        left: 80,
        right: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    avatarWrap: {
        marginRight: 14,
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#222',
    },
    activeDot: {
        position: 'absolute',
        top: 1,
        right: 1,
        width: 13,
        height: 13,
        borderRadius: 6.5,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#0f0f0f',
    },
    info: {
        flex: 1,
        gap: 4,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    time: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    preview: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        flex: 1,
        marginRight: 8,
    },
    checkmarks: {
        color: '#22c55e',
        fontSize: 11,
    },
    unreadBadge: {
        backgroundColor: '#22c55e',
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    unreadText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#22c55e',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    fabIcon: {
        color: '#fff',
        fontSize: 22,
    },
});
