// components/BankScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { StatusBar } from './StatusBar';
import { Gauge } from './Gauge';
import { LEVELS } from '../constants/game-data';
import { UI_BANK } from '../constants/dialogues';
import { DebtPack, Batch } from '../types/game';

const formatMoney = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
    return Math.floor(n).toString();
};

// ─── Pack inventory card ───────────────────────────────────────────────────────
interface PackCardProps {
    pack: DebtPack;
    onSell: () => void;
}

function PackCard({ pack, onSell }: PackCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.cardLeft}>
                <Text style={styles.cardValue}>R$ {formatMoney(pack.value)}</Text>
                <Text style={styles.cardMeta}>{pack.cpfsUsed} CPFs · Dia {pack.dayCreated}</Text>
            </View>
            <TouchableOpacity style={styles.sellChip} onPress={onSell}>
                <Text style={styles.sellChipText}>VENDER →</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Debt batch card ───────────────────────────────────────────────────────────
interface BatchCardProps {
    batch: Batch;
}

function BatchCard({ batch }: BatchCardProps) {
    const isCritical = batch.days < 30;
    return (
        <View style={[styles.card, isCritical && styles.cardCritical]}>
            <View style={styles.cardLeft}>
                <Text style={[styles.cardValue, { color: '#4da6ff' }]}>R$ {formatMoney(batch.due)}</Text>
                <Text style={styles.cardMeta}>a devolver</Text>
            </View>
            <View style={[styles.timerBadge, isCritical && styles.timerBadgeCritical]}>
                <Text style={[styles.timerText, isCritical && styles.timerTextCritical]}>
                    {isCritical ? '⚠️ ' : '⏰ '}{batch.days} dias
                </Text>
            </View>
        </View>
    );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export function BankScreen() {
    const {
        suspicion, pressure,
        dirty, cpfs, clean,
        batches, debtPacks,
        levelIdx, totalWashed, tutStep, actions
    } = useGameStore(state => state);

    const lvl = LEVELS[levelIdx];

    // Tutorial logic
    const isTutorial = tutStep < 8;
    const shouldHighlightLoan = tutStep === 6;
    const shouldHighlightSell = tutStep === 7;
    const shouldDisableButtons = isTutorial && tutStep !== 6 && tutStep !== 7;

    const openLoanModal = () => actions.setModal('loan');
    const openPayModal = () => actions.setModal('pay');
    const openSellModal = (packId: number) => actions.openSellModal(packId);

    // For the VENDER DÍVIDA button: uses oldest pack
    const firstPack = debtPacks[0];

    return (
        <View style={styles.screen}>
            <StatusBar />

            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.levelLabel}>NÍV. {levelIdx + 1}: {lvl.name.toUpperCase()}</Text>
                <Text style={styles.goalLabel}>META: {formatMoney(totalWashed)} / {lvl.goal !== null ? formatMoney(lvl.goal) : '∞'}</Text>
            </View>

            {/* ── Gauges ── */}
            <View style={styles.gauges}>
                <Gauge label="SUSPEITA (PF)" value={suspicion} color="#ff3b30" />
                <Gauge label="COBRANÇA (CARTEL)" value={pressure} color="#4da6ff" />
            </View>

            {/* ── Resources ── */}
            <View style={styles.resources}>
                <View style={styles.resourceCol}>
                    <Text style={styles.resourceLabel}>SUJO</Text>
                    <Text style={[styles.resourceValue, styles.gold]}>R$ {formatMoney(dirty)}</Text>
                </View>
                <View style={[styles.resourceCol, styles.resourceDivider]}>
                    <Text style={styles.resourceLabel}>CPFs</Text>
                    <Text style={styles.resourceValue}>{cpfs}</Text>
                </View>
                <View style={styles.resourceCol}>
                    <Text style={styles.resourceLabel}>LIMPO</Text>
                    <Text style={[styles.resourceValue, styles.green]}>R$ {formatMoney(clean)}</Text>
                </View>
            </View>

            {/* ── Scrollable mid-section ── */}
            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>

                {/* Debt pack inventory */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {UI_BANK.packSection}
                        <Text style={styles.sectionCount}> ({debtPacks.length})</Text>
                    </Text>
                    {debtPacks.length === 0 ? (
                        <Text style={styles.emptyText}>{UI_BANK.packEmpty}</Text>
                    ) : (
                        debtPacks.map(pack => (
                            <PackCard
                                key={pack.id}
                                pack={pack}
                                onSell={() => openSellModal(pack.id)}
                            />
                        ))
                    )}
                </View>

                {/* Debt repayment queue */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {UI_BANK.debtSection}
                        <Text style={styles.sectionCount}> ({batches.length})</Text>
                    </Text>
                    {batches.length === 0 ? (
                        <Text style={styles.emptyText}>{UI_BANK.debtEmpty}</Text>
                    ) : (
                        batches.map(batch => (
                            <BatchCard key={batch.id} batch={batch} />
                        ))
                    )}
                </View>

            </ScrollView>

            {/* ── Action row ── */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[
                        styles.btn,
                        shouldHighlightLoan && styles.highlighted,
                        shouldDisableButtons && styles.disabled,
                    ]}
                    onPress={openLoanModal}
                    disabled={shouldDisableButtons}
                >
                    <Text style={styles.btnText}>{UI_BANK.btnCreateLoan}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.btn,
                        styles.btnSell,
                        shouldHighlightSell && styles.highlighted,
                        (shouldDisableButtons || !firstPack) && styles.disabled,
                    ]}
                    onPress={() => firstPack && openSellModal(firstPack.id)}
                    disabled={shouldDisableButtons || !firstPack}
                >
                    <Text style={styles.btnText}>{UI_BANK.btnSellPack}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.btn,
                        styles.btnPay,
                        shouldDisableButtons && styles.disabled,
                    ]}
                    onPress={openPayModal}
                    disabled={shouldDisableButtons}
                >
                    <Text style={styles.btnText}>{UI_BANK.btnPayDebt}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    levelLabel: {
        fontSize: 11,
        color: '#aaa',
        textTransform: 'uppercase',
    },
    goalLabel: {
        fontSize: 11,
        color: '#555',
    },
    gauges: {
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 4,
    },
    resources: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#222',
        marginTop: 6,
    },
    resourceCol: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    resourceDivider: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#222',
    },
    resourceLabel: {
        fontSize: 10,
        color: '#555',
        textTransform: 'uppercase',
        marginBottom: 3,
        letterSpacing: 0.5,
    },
    resourceValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: 'Courier',
    },
    gold: { color: '#D4AF37' },
    green: { color: '#00ff41' },
    scrollArea: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginTop: 16,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 11,
        color: '#aaa',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        fontWeight: '600',
    },
    sectionCount: {
        color: '#555',
        fontWeight: 'normal',
    },
    emptyText: {
        color: '#444',
        fontSize: 13,
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardCritical: {
        borderLeftWidth: 3,
        borderLeftColor: '#ff3b30',
        backgroundColor: 'rgba(255,59,48,0.05)',
    },
    cardLeft: {
        flex: 1,
    },
    cardValue: {
        color: '#D4AF37',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Courier',
        marginBottom: 2,
    },
    cardMeta: {
        color: '#555',
        fontSize: 11,
    },
    sellChip: {
        backgroundColor: 'rgba(0,255,65,0.1)',
        borderWidth: 1,
        borderColor: '#00ff41',
        borderRadius: 6,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    sellChipText: {
        color: '#00ff41',
        fontSize: 11,
        fontWeight: 'bold',
    },
    timerBadge: {
        backgroundColor: '#222',
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    timerBadgeCritical: {
        backgroundColor: 'rgba(255,59,48,0.15)',
        borderWidth: 1,
        borderColor: '#ff3b30',
    },
    timerText: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: '600',
    },
    timerTextCritical: {
        color: '#ff3b30',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        paddingBottom: 8,
        backgroundColor: '#0f0f0f',
        borderTopWidth: 1,
        borderColor: '#1a1a1a',
    },
    btn: {
        flex: 1,
        height: 52,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 10,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    btnSell: {
        borderColor: '#1a4a1a',
        backgroundColor: 'rgba(0,80,0,0.2)',
    },
    btnPay: {
        borderColor: '#005c4b',
        backgroundColor: 'rgba(0, 92, 75, 0.15)',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 14,
    },
    highlighted: {
        borderColor: '#00ff41',
        borderWidth: 2,
        backgroundColor: 'rgba(0, 255, 65, 0.1)',
    },
    disabled: {
        opacity: 0.3,
    },
});
