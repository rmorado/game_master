// components/CarteiraScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { TUTORIAL } from '../constants/dialogues';
import { useStrings } from '../constants/strings';
import { formatBRL } from '../utils/format';

const GREEN = '#22c55e';

export function CarteiraScreen() {
    const { dirty, clean, tutStep, actions } = useGameStore(useShallow(s => ({
        dirty: s.dirty,
        clean: s.clean,
        tutStep: s.tutStep,
        actions: s.actions,
    })));

    const str = useStrings();
    const isTutorial = tutStep < TUTORIAL.length;
    const highlightSend = isTutorial && tutStep === 15;

    const [pct, setPct] = useState(0);

    const transferAmount = Math.floor(clean * (pct / 100));
    const remaining = clean - transferAmount;
    const canSend = transferAmount > 0 && clean > 0;

    const handleSend = () => {
        if (!canSend) return;
        actions.payPCC(transferAmount);
        setPct(0);
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
        paddingVertical: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#1f1f2e',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 15,
        fontFamily: 'Courier',
    },
    balanceRight: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    balanceCurrency: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: 'Courier',
    },
    balanceValue: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    colorDirty: { color: '#f97316' },
    colorClean: { color: GREEN },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#1f1f2e',
    },

    // Transfer
    transferSection: {
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 24,
        gap: 0,
    },
    sectionTitle: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11,
        fontFamily: 'Courier',
        letterSpacing: 1.5,
        marginBottom: 20,
    },
    pctRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    pctLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: 'Courier',
    },
    pctRight: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    pctValue: {
        color: GREEN,
        fontSize: 32,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    pctSub: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 14,
        fontFamily: 'Courier',
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    maxBtn: {
        borderWidth: 1.5,
        borderColor: GREEN,
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    maxBtnText: {
        color: GREEN,
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Courier',
        letterSpacing: 1,
    },

    // Amount preview
    amountSection: {
        paddingVertical: 20,
    },
    amountLabel: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
        fontFamily: 'Courier',
        marginBottom: 4,
    },
    amountValue: {
        color: '#fff',
        fontSize: 44,
        fontWeight: '800',
        fontFamily: 'Courier',
        letterSpacing: -1,
        marginBottom: 6,
    },
    amountRest: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 13,
        fontFamily: 'Courier',
    },

    // Send button
    sendBtn: {
        backgroundColor: GREEN,
        borderRadius: 4,
        paddingVertical: 20,
        alignItems: 'center',
        marginTop: 20,
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
