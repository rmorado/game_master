// components/DossieScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { getCharacter } from '../constants/dialogues';
import { formatMoney } from '../utils/format';
import { useStrings } from '../constants/strings';
import { resolveBi } from '../utils/dialogue';

const AMBER = '#f59e0b';
const GREEN = '#22c55e';
const ORANGE = '#f97316';
const MUTED = 'rgba(255,255,255,0.3)';

type StatusKey = 'statusPending' | 'statusWaiting' | 'statusActive' | 'statusUrgent' | 'statusDone' | 'statusResolved';
type StatusConfig = { key: StatusKey; color: string };

function getContactStatus(
    id: string,
    state: { hasPendingBag: boolean; hasUsedNotNow: boolean; dialoguesSeen: string[] }
): StatusConfig {
    const seen = state.dialoguesSeen;
    switch (id) {
        case 'drugdealer':
            if (state.hasPendingBag) return { key: 'statusPending', color: AMBER };
            if (state.hasUsedNotNow) return { key: 'statusWaiting', color: AMBER };
            return { key: 'statusActive', color: GREEN };
        case 'hacker':
            return { key: 'statusActive', color: GREEN };
        case 'investigador':
            if (!seen.includes('investigador_comply') && !seen.includes('investigador_stall'))
                return { key: 'statusUrgent', color: '#ef4444' };
            return { key: 'statusDone', color: MUTED };
        case 'anonimo':
            if (!seen.includes('blackmail_pay') && !seen.includes('blackmail_ignore'))
                return { key: 'statusPending', color: AMBER };
            return { key: 'statusResolved', color: MUTED };
        case 'lawyer':
            return { key: 'statusActive', color: GREEN };
        case 'deputy':
            if (seen.includes('deputy_help_bc')) return { key: 'statusDone', color: MUTED };
            return { key: 'statusActive', color: GREEN };
        case 'judge':
            if (seen.includes('judge_intro_talk')) return { key: 'statusDone', color: MUTED };
            return { key: 'statusActive', color: GREEN };
        case 'madame':
            if (seen.includes('madame_pay')) return { key: 'statusDone', color: MUTED };
            return { key: 'statusActive', color: GREEN };
        default:
            return { key: 'statusActive', color: GREEN };
    }
}

const CONTACT_ORDER = ['drugdealer', 'hacker', 'investigador', 'anonimo', 'lawyer', 'deputy', 'judge', 'madame'];

export function DossieScreen() {
    const {
        dirty, clean, cpfs, totalReceived, totalPaid, transfersByContact,
        contacts, hasPendingBag, hasUsedNotNow, dialoguesSeen,
        language, actions,
    } = useGameStore(useShallow(s => ({
        dirty: s.dirty,
        clean: s.clean,
        cpfs: s.cpfs,
        totalReceived: s.totalReceived,
        totalPaid: s.totalPaid,
        transfersByContact: s.transfersByContact,
        contacts: s.contacts,
        hasPendingBag: s.hasPendingBag,
        hasUsedNotNow: s.hasUsedNotNow,
        dialoguesSeen: s.dialoguesSeen,
        language: s.language,
        actions: s.actions,
    })));
    const str = useStrings();

    const statusState = { hasPendingBag, hasUsedNotNow, dialoguesSeen };
    const unlockedContacts = CONTACT_ORDER.filter(id => contacts[id]);

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => actions.setActiveApp('home')} hitSlop={12}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{str.dossie.header}</Text>
                <View style={styles.classifiedBadge}>
                    <Text style={styles.classifiedText}>{str.dossie.badge}</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Financial section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{str.dossie.sectionFinancial}</Text>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{str.dossie.rowReceived}</Text>
                        <Text style={[styles.rowValue, { color: AMBER }]}>R$ {formatMoney(totalReceived)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{str.dossie.rowPaid}</Text>
                        <Text style={[styles.rowValue, { color: AMBER }]}>R$ {formatMoney(totalPaid)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{str.dossie.rowDirty}</Text>
                        <Text style={[styles.rowValue, { color: ORANGE }]}>R$ {formatMoney(dirty)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{str.dossie.rowClean}</Text>
                        <Text style={[styles.rowValue, { color: GREEN }]}>R$ {formatMoney(clean)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{str.dossie.rowCpfs}</Text>
                        <Text style={[styles.rowValue, { color: '#fff' }]}>{cpfs.toLocaleString('pt-BR')}</Text>
                    </View>
                </View>

                {/* Contacts section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{str.dossie.sectionContacts}</Text>

                    {unlockedContacts.map(id => {
                        const char = getCharacter(id);
                        if (!char) return null;
                        const status = getContactStatus(id, statusState);
                        const transferred = transfersByContact[id] ?? 0;

                        return (
                            <View key={id}>
                                <View style={styles.contactRow}>
                                    <Image source={char.avatar} style={styles.avatar} />
                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactName}>{resolveBi(char.name, language)}</Text>
                                        <View style={styles.statusRow}>
                                            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                                            <Text style={[styles.statusLabel, { color: status.color }]}>{str.dossie[status.key]}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.transferAmount}>R$ {formatMoney(transferred)}</Text>
                                </View>
                                <View style={styles.divider} />
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0d1117',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 14,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(245,158,11,0.2)',
        gap: 10,
    },
    backArrow: {
        color: AMBER,
        fontSize: 26,
        lineHeight: 30,
    },
    headerTitle: {
        flex: 1,
        color: AMBER,
        fontSize: 13,
        fontFamily: 'Courier',
        fontWeight: '700',
        letterSpacing: 2,
    },
    classifiedBadge: {
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.4)',
        borderRadius: 4,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    classifiedText: {
        color: 'rgba(245,158,11,0.6)',
        fontSize: 9,
        fontFamily: 'Courier',
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    section: {
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 8,
    },
    sectionLabel: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 10,
        fontFamily: 'Courier',
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    rowLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontFamily: 'Courier',
    },
    rowValue: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(245,158,11,0.1)',
    },

    // Contacts
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#1a1a2e',
    },
    contactInfo: {
        flex: 1,
        gap: 4,
    },
    contactName: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Courier',
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusLabel: {
        fontSize: 11,
        fontFamily: 'Courier',
    },
    transferAmount: {
        color: AMBER,
        fontSize: 12,
        fontFamily: 'Courier',
        fontWeight: '700',
    },
});
