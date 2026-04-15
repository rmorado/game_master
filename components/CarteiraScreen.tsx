// components/CarteiraScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { TUTORIAL } from '../constants/dialogues';
import { useStrings } from '../constants/strings';
import { gameDate } from '../constants/game-data';
import { formatBRL } from '../utils/format';

const GREEN = '#22c55e';

export function CarteiraScreen() {
    const { dirty, clean, swissAccount, batches, day, language, dialoguesSeen, tutStep, actions } = useGameStore(useShallow(s => ({
        dirty: s.dirty,
        clean: s.clean,
        swissAccount: s.swissAccount,
        batches: s.batches,
        day: s.day,
        language: s.language,
        dialoguesSeen: s.dialoguesSeen,
        tutStep: s.tutStep,
        actions: s.actions,
    })));

    const str = useStrings();
    const isTutorial = tutStep < TUTORIAL.length;
    const highlightSend = isTutorial && tutStep === 15;

    // batches are always appended in id order (Date.now()), so [0] is the oldest
    const { nextBatch, isUrgent } = useMemo(() => {
        const next = batches.length > 0 ? batches[0] : null;
        return { nextBatch: next, isUrgent: next !== null && next.days < 30 };
    }, [batches]);

    const hideUnlocked = dialoguesSeen.includes('contador_ja_era_hora');

    const [pct, setPct] = useState(0);
    const [hidePct, setHidePct] = useState(0);

    const transferAmount = Math.floor(clean * (pct / 100));
    const remaining = clean - transferAmount;
    const canSend = transferAmount > 0 && clean > 0;

    const hideAmount = Math.floor(clean * (hidePct / 100));
    const canHide = hideAmount > 0 && clean > 0;

    const handleSend = () => {
        if (!canSend) return;
        actions.payPCC(transferAmount);
        setPct(0);
    };

    const handleHide = () => {
        if (!canHide) return;
        actions.hideClean(hideAmount);
        setHidePct(0);
    };

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.backArrow}>‹</Text>
                <Text style={styles.appName}>{str.carteira.appName}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Balances */}
                <View style={styles.balanceSection}>
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>{str.carteira.labelDirty}</Text>
                        <View style={styles.balanceRight}>
                            <Text style={styles.balanceCurrency}>{str.carteira.currency}</Text>
                            <Text style={[styles.balanceValue, styles.colorDirty]}>{formatBRL(dirty)}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>{str.carteira.labelClean}</Text>
                        <View style={styles.balanceRight}>
                            <Text style={styles.balanceCurrency}>{str.carteira.currency}</Text>
                            <Text style={[styles.balanceValue, styles.colorClean]}>{formatBRL(clean)}</Text>
                        </View>
                    </View>
                    {hideUnlocked && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.balanceRow}>
                                <Text style={styles.balanceLabel}>{str.carteira.labelSwissBalance}</Text>
                                <View style={styles.balanceRight}>
                                    <Text style={styles.balanceCurrency}>{str.carteira.currency}</Text>
                                    <Text style={[styles.balanceValue, styles.colorSwiss]}>{formatBRL(swissAccount)}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Next Payment */}
                <View style={styles.nextPaymentSection}>
                    <Text style={styles.sectionTitle}>{str.carteira.sectionNextPayment}</Text>
                    {nextBatch ? (
                        <>
                            <View style={styles.nextPaymentRow}>
                                <Text style={styles.nextPaymentCurrency}>{str.carteira.currency}</Text>
                                <Text style={[styles.nextPaymentValue, isUrgent && styles.colorUrgent]}>
                                    {formatBRL(nextBatch.due)}
                                </Text>
                            </View>
                            <View style={styles.nextPaymentMeta}>
                                <Text style={[styles.nextPaymentDate, isUrgent && styles.colorUrgent]}>
                                    {gameDate(day + nextBatch.days, language)}
                                </Text>
                                <Text style={[styles.nextPaymentDays, isUrgent && styles.colorUrgent]}>
                                    {isUrgent
                                        ? str.carteira.labelUrgent(nextBatch.days)
                                        : str.carteira.labelDaysLeft(nextBatch.days)}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <Text style={styles.noPending}>{str.carteira.labelNoPending}</Text>
                    )}
                </View>

                {/* Transfer section */}
                <View style={styles.transferSection}>
                    <Text style={styles.sectionTitle}>{str.carteira.sectionTransfer}</Text>

                    {/* Percentage row */}
                    <View style={styles.pctRow}>
                        <Text style={styles.pctLabel}>{str.carteira.labelEnviar}</Text>
                        <View style={styles.pctRight}>
                            <Text style={styles.pctValue}>{pct}%</Text>
                            <Text style={styles.pctSub}>{str.carteira.labelDoLimpo}</Text>
                        </View>
                    </View>

                    {/* Slider + MAX */}
                    <View style={[styles.sliderRow, isTutorial && tutStep !== 15 && { opacity: 0.35 }]}>
                        <Slider
                            style={styles.slider}
                            value={pct}
                            onValueChange={isTutorial && tutStep !== 15 ? undefined : setPct}
                            minimumValue={0}
                            maximumValue={100}
                            step={1}
                            minimumTrackTintColor={GREEN}
                            maximumTrackTintColor="#1e1e2a"
                            thumbTintColor={GREEN}
                            disabled={isTutorial && tutStep !== 15}
                        />
                        <TouchableOpacity
                            style={styles.maxBtn}
                            onPress={() => setPct(100)}
                            disabled={isTutorial && tutStep !== 15}
                        >
                            <Text style={styles.maxBtnText}>{str.carteira.maxBtn}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Amount preview */}
                    <View style={styles.amountSection}>
                        <Text style={styles.amountLabel}>{str.carteira.labelAEnviar}</Text>
                        <Text style={styles.amountValue}>{str.carteira.currency} {formatBRL(transferAmount)}</Text>
                        <Text style={styles.amountRest}>{str.carteira.labelResta(formatBRL(remaining))}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Send button */}
                    <TouchableOpacity
                        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled, highlightSend && styles.sendBtnHighlight]}
                        onPress={handleSend}
                        disabled={!canSend || (isTutorial && tutStep !== 15)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.sendBtnText}>{str.carteira.sendBtn}</Text>
                    </TouchableOpacity>
                </View>

                {/* Esconder Dinheiro */}
                {hideUnlocked && (
                    <View style={styles.transferSection}>
                        <Text style={styles.sectionTitle}>{str.carteira.sectionHide}</Text>

                        <View style={styles.pctRow}>
                            <Text style={styles.pctLabel}>{str.carteira.labelEnviar}</Text>
                            <View style={styles.pctRight}>
                                <Text style={[styles.pctValue, styles.colorSwiss]}>{hidePct}%</Text>
                                <Text style={styles.pctSub}>{str.carteira.labelDoLimpo}</Text>
                            </View>
                        </View>

                        <View style={styles.sliderRow}>
                            <Slider
                                style={styles.slider}
                                value={hidePct}
                                onValueChange={setHidePct}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                minimumTrackTintColor="#4ade80"
                                maximumTrackTintColor="#1e1e2a"
                                thumbTintColor="#4ade80"
                            />
                            <TouchableOpacity style={styles.maxBtnSwiss} onPress={() => setHidePct(100)}>
                                <Text style={styles.maxBtnTextSwiss}>{str.carteira.maxBtn}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.amountSection}>
                            <Text style={styles.amountLabel}>{str.carteira.labelAEnviar}</Text>
                            <Text style={[styles.amountValue, styles.colorSwiss]}>{str.carteira.currency} {formatBRL(hideAmount)}</Text>
                            <Text style={styles.amountRest}>{str.carteira.labelResta(formatBRL(clean - hideAmount))}</Text>
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={[styles.hideBtn, !canHide && styles.sendBtnDisabled]}
                            onPress={handleHide}
                            disabled={!canHide}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.hideBtnText}>{str.carteira.hideBtn}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Histórico */}
                <View style={styles.historicoSection}>
                    <Text style={styles.sectionTitle}>{str.carteira.sectionHistory}</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0e0e14',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 14,
        paddingBottom: 10,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#1f1f2e',
        gap: 6,
    },
    backArrow: {
        color: GREEN,
        fontSize: 26,
        lineHeight: 30,
    },
    appName: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 15,
        fontFamily: 'Courier',
        letterSpacing: 1,
    },

    // Balances
    balanceSection: {
        paddingHorizontal: 24,
        paddingVertical: 2,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#1f1f2e',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontFamily: 'Courier',
    },
    balanceRight: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    balanceCurrency: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: 'Courier',
    },
    balanceValue: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    colorDirty: { color: '#f97316' },
    colorClean: { color: GREEN },
    colorSwiss: { color: '#4ade80' },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#1f1f2e',
    },

    // Next Payment
    nextPaymentSection: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#1f1f2e',
        gap: 4,
    },
    nextPaymentRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    nextPaymentCurrency: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontFamily: 'Courier',
    },
    nextPaymentValue: {
        color: GREEN,
        fontSize: 22,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    nextPaymentMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nextPaymentDate: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: 'Courier',
        letterSpacing: 0.5,
    },
    nextPaymentDays: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 11,
        fontFamily: 'Courier',
    },
    noPending: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        fontFamily: 'Courier',
        letterSpacing: 1,
    },
    colorUrgent: { color: '#ef4444' },

    // Transfer
    transferSection: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 0,
    },
    sectionTitle: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11,
        fontFamily: 'Courier',
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    pctRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    pctLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontFamily: 'Courier',
    },
    pctRight: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    pctValue: {
        color: GREEN,
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    pctSub: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
        fontFamily: 'Courier',
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    slider: {
        flex: 1,
        height: 36,
    },
    maxBtn: {
        borderWidth: 1.5,
        borderColor: GREEN,
        borderRadius: 6,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    maxBtnText: {
        color: GREEN,
        fontSize: 11,
        fontWeight: '700',
        fontFamily: 'Courier',
        letterSpacing: 1,
    },

    // Amount preview
    amountSection: {
        paddingVertical: 10,
    },
    amountLabel: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 12,
        fontFamily: 'Courier',
        marginBottom: 2,
    },
    amountValue: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
        fontFamily: 'Courier',
        letterSpacing: -1,
        marginBottom: 3,
    },
    amountRest: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontFamily: 'Courier',
    },

    // Send button
    sendBtn: {
        backgroundColor: GREEN,
        borderRadius: 4,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    sendBtnDisabled: {
        opacity: 0.3,
    },
    sendBtnHighlight: {
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
    },
    maxBtnSwiss: {
        borderWidth: 1.5,
        borderColor: '#4ade80',
        borderRadius: 6,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    maxBtnTextSwiss: {
        color: '#4ade80',
        fontSize: 11,
        fontWeight: '700',
        fontFamily: 'Courier',
        letterSpacing: 1,
    },
    hideBtn: {
        backgroundColor: '#166534',
        borderWidth: 1,
        borderColor: '#4ade80',
        borderRadius: 4,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    hideBtnText: {
        color: '#4ade80',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
        fontFamily: 'Courier',
    },
    sendBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
        fontFamily: 'Courier',
    },

    // Histórico
    historicoSection: {
        paddingHorizontal: 24,
        paddingTop: 28,
    },
});
