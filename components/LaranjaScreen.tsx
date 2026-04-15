// components/LaranjaScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { useStrings } from '../constants/strings';
import { LOAN_OPTIONS, MS_PER_DAY, CPF_LOAN_VALUE } from '../constants/game-data';
import { formatBRL } from '../utils/format';

const ORANGE = '#f97316';

const generateFakeCPF = () => {
    const r = (n: number) => Math.floor(Math.random() * n).toString().padStart(3, '0');
    return `${r(1000)}.${r(1000)}.${r(1000)}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
};

export function LaranjaScreen() {
    const { cpfs, dirty, tutStep, pendingLoan, actions } = useGameStore(useShallow(s => ({
        cpfs: s.cpfs,
        dirty: s.dirty,
        tutStep: s.tutStep,
        pendingLoan: s.pendingLoan,
        actions: s.actions,
    })));

    const str = useStrings();
    const [progress, setProgress] = useState(0);
    const shouldHighlight = tutStep === 7;

    // Animate progress bar when pendingLoan is active
    useEffect(() => {
        if (!pendingLoan) {
            setProgress(0);
            return;
        }
        const tick = () => {
            const elapsed = Date.now() - (pendingLoan.endsAt - pendingLoan.durationMs);
            setProgress(Math.min(1, elapsed / pendingLoan.durationMs));
        };
        tick();
        const interval = setInterval(tick, 250);
        return () => clearInterval(interval);
    }, [pendingLoan]);

    const cpfPreview = useMemo(() =>
        pendingLoan ? Array.from({ length: Math.min(pendingLoan.cpfCount, 14) }, generateFakeCPF) : [],
        [pendingLoan?.cpfCount]
    );

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.backArrow}>‹</Text>
                <Text style={styles.appName}>{str.laranjas.appName}</Text>
            </View>

            {pendingLoan ? (
                <View style={styles.processingContainer}>
                    <Text style={styles.processingTitle}>PROCESSANDO</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as `${number}%` }]} />
                    </View>
                    <Text style={styles.processingLabel}>{str.laranjas.processingLabel}</Text>
                    <View style={styles.cpfFlash}>
                        {cpfPreview.map((cpf, i) => (
                            <Text key={i} style={styles.cpfFlashItem}>{cpf}</Text>
                        ))}
                    </View>
                </View>
            ) : (
                <View style={styles.body}>
                    <View style={styles.spacer} />

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{str.laranjas.labelCpfAvail}</Text>
                        <Text style={styles.rowValue}>{cpfs}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.optionsSection}>
                        {LOAN_OPTIONS.map(opt => {
                            const cost = opt.cpfCount * CPF_LOAN_VALUE;
                            const days = Math.round(opt.durationMs / MS_PER_DAY);
                            const canAfford = dirty >= cost && cpfs >= opt.cpfCount;
                            const disabled = !canAfford || (tutStep > 0 && tutStep < 7);
                            return (
                                <TouchableOpacity
                                    key={opt.cpfCount}
                                    style={[
                                        styles.optionBtn,
                                        disabled && styles.optionBtnDisabled,
                                        shouldHighlight && !disabled && styles.optionBtnHighlight,
                                    ]}
                                    onPress={() => actions.startLoan(opt.cpfCount, opt.durationMs)}
                                    disabled={disabled}
                                    activeOpacity={0.75}
                                >
                                    <View style={styles.optionLeft}>
                                        <Text style={styles.optionCpf}>{opt.cpfCount} CPFs</Text>
                                        <Text style={styles.optionDays}>{str.laranjas.btnDias(days)}</Text>
                                    </View>
                                    <Text style={styles.optionCost}>R$ {formatBRL(cost)}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={styles.warning}>{str.laranjas.warning}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 14,
        paddingBottom: 10,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#1f1f1f',
        gap: 6,
    },
    backArrow: {
        color: ORANGE,
        fontSize: 26,
        lineHeight: 30,
    },
    appName: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 15,
        fontFamily: 'Courier',
        letterSpacing: 1,
    },

    body: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    spacer: {
        flex: 1,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    rowLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: 'Courier',
    },
    rowValue: {
        color: ORANGE,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#222',
    },

    optionsSection: {
        gap: 10,
        paddingVertical: 24,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: ORANGE,
        borderRadius: 6,
        paddingVertical: 16,
        paddingHorizontal: 18,
    },
    optionBtnDisabled: {
        borderColor: '#333',
        opacity: 0.4,
    },
    optionBtnHighlight: {
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 6,
    },
    optionLeft: {
        gap: 3,
    },
    optionCpf: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    optionDays: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 11,
        fontFamily: 'Courier',
        letterSpacing: 0.5,
    },
    optionCost: {
        color: ORANGE,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Courier',
    },

    warning: {
        color: ORANGE,
        fontSize: 12,
        fontFamily: 'Courier',
        textAlign: 'center',
        opacity: 0.7,
        marginTop: 4,
    },

    // Processing
    processingContainer: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    processingTitle: {
        color: ORANGE,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Courier',
        letterSpacing: 2,
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: '#1a1a1a',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: ORANGE,
    },
    processingLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        letterSpacing: 2,
        fontFamily: 'Courier',
    },
    cpfFlash: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    cpfFlashItem: {
        color: ORANGE,
        fontSize: 10,
        fontFamily: 'Courier',
        opacity: 0.5,
    },
});
