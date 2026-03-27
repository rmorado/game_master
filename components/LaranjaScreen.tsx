// components/LaranjaScreen.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { LEVELS } from '../constants/game-data';
import { UI_LARANJAS } from '../constants/dialogues';
import { formatBRL } from '../utils/format';

const ORANGE = '#f97316';

const generateFakeCPF = () => {
    const r = (n: number) => Math.floor(Math.random() * n).toString().padStart(3, '0');
    return `${r(1000)}.${r(1000)}.${r(1000)}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
};

type ScreenState = 'idle' | 'processing' | 'success';

export function LaranjaScreen() {
    const { cpfs, dirty, levelIdx, tutStep, actions } = useGameStore(useShallow(s => ({
        cpfs: s.cpfs,
        dirty: s.dirty,
        levelIdx: s.levelIdx,
        tutStep: s.tutStep,
        actions: s.actions,
    })));

    const [sliderValue, setSliderValue] = useState(1);
    const [screenState, setScreenState] = useState<ScreenState>('idle');
    const [progressAnim] = useState(new Animated.Value(0));
    const timer1 = useRef<ReturnType<typeof setTimeout> | null>(null);
    const timer2 = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timer1.current) clearTimeout(timer1.current);
            if (timer2.current) clearTimeout(timer2.current);
        };
    }, []);

    const currentLevel = LEVELS[levelIdx];
    const maxCPFs = Math.max(1, Math.min(cpfs, Math.floor(dirty / 5000)));
    const clampedSlider = Math.max(1, Math.min(sliderValue, maxCPFs));

    const pct = cpfs > 0 ? Math.round((clampedSlider / maxCPFs) * 100) : 0;
    const loanValue = clampedSlider * 5000;
    const canConfirm = cpfs >= clampedSlider && dirty >= loanValue && cpfs >= 1;
    const shouldHighlight = tutStep === 6;

    useEffect(() => {
        if (sliderValue > maxCPFs) setSliderValue(maxCPFs);
    }, [maxCPFs]);

    // Set to max when entering the screen
    useEffect(() => {
        setSliderValue(maxCPFs);
    }, []);

    const cpfPreview = useMemo(() =>
        Array.from({ length: Math.min(clampedSlider, 14) }, generateFakeCPF),
        [clampedSlider]
    );

    const handleConfirm = () => {
        if (!canConfirm || screenState !== 'idle') return;
        setScreenState('processing');

        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2400,
            useNativeDriver: false,
        }).start();

        timer1.current = setTimeout(() => {
            actions.confirmLoan(clampedSlider);
            setScreenState('success');
        }, 2500);

        timer2.current = setTimeout(() => {
            setScreenState('idle');
            progressAnim.setValue(0);
        }, 4200);
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.backArrow}>‹</Text>
                <Text style={styles.appName}>{UI_LARANJAS.appName}</Text>
            </View>

            {screenState === 'success' ? (
                <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>{UI_LARANJAS.successIcon}</Text>
                    <Text style={styles.successTitle}>{UI_LARANJAS.successTitle}</Text>
                    <Text style={styles.successSub}>{UI_LARANJAS.successSub}</Text>
                </View>

            ) : screenState === 'processing' ? (
                <View style={styles.processingContainer}>
                    <Text style={styles.processingTitle}>{UI_LARANJAS.processingTitle}</Text>
                    <View style={styles.progressBar}>
                        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                    </View>
                    <Text style={styles.processingLabel}>{UI_LARANJAS.processingLabel}</Text>
                    <View style={styles.cpfFlash}>
                        {cpfPreview.map((cpf, i) => (
                            <Text key={i} style={styles.cpfFlashItem}>{cpf}</Text>
                        ))}
                    </View>
                </View>

            ) : (
                <View style={styles.body}>
                    {/* Top spacer */}
                    <View style={styles.spacer} />

                    {/* CPF rows */}
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{UI_LARANJAS.labelCpfAvail}</Text>
                        <Text style={styles.rowValue}>{cpfs}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{UI_LARANJAS.labelCpfSelected}</Text>
                        <Text style={styles.rowValue}>{clampedSlider}</Text>
                    </View>
                    <View style={styles.divider} />

                    {/* Usar / percentage */}
                    <View style={styles.usarRow}>
                        <Text style={styles.usarLabel}>{UI_LARANJAS.labelUsar}</Text>
                        <View style={styles.usarRight}>
                            <Text style={styles.pct}>{pct}%</Text>
                            <Text style={styles.pctSub}> — {clampedSlider} CPF</Text>
                        </View>
                    </View>

                    {/* Slider + MAX */}
                    <View style={styles.sliderRow}>
                        <Slider
                            style={styles.slider}
                            value={clampedSlider}
                            onValueChange={setSliderValue}
                            minimumValue={1}
                            maximumValue={maxCPFs}
                            step={1}
                            minimumTrackTintColor={ORANGE}
                            maximumTrackTintColor="#2a2a2a"
                            thumbTintColor={ORANGE}
                        />
                        <TouchableOpacity style={styles.maxBtn} onPress={() => setSliderValue(maxCPFs)}>
                            <Text style={styles.maxBtnText}>{UI_LARANJAS.maxBtn}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Loan amount */}
                    <View style={styles.loanBlock}>
                        <Text style={styles.loanLabel}>{UI_LARANJAS.labelLoan}</Text>
                        <Text style={styles.loanAmount}>R$ {formatBRL(loanValue)}</Text>
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                        style={[
                            styles.cta,
                            (!canConfirm || (tutStep < 6 && tutStep !== 0)) && styles.ctaDisabled,
                            shouldHighlight && styles.ctaHighlight,
                        ]}
                        onPress={handleConfirm}
                        disabled={!canConfirm || (tutStep < 6 && tutStep !== 0)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.ctaText}>{UI_LARANJAS.ctaBtn}</Text>
                    </TouchableOpacity>

                    <Text style={styles.warning}>{UI_LARANJAS.warning}</Text>
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

    // Data rows
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

    // Usar / percentage
    usarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 4,
    },
    usarLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: 'Courier',
    },
    usarRight: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    pct: {
        color: ORANGE,
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    pctSub: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: 'Courier',
    },

    // Slider
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    maxBtn: {
        borderWidth: 1.5,
        borderColor: ORANGE,
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    maxBtnText: {
        color: ORANGE,
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Courier',
        letterSpacing: 1,
    },

    // Loan amount
    loanBlock: {
        paddingVertical: 20,
    },
    loanLabel: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
        fontFamily: 'Courier',
        marginBottom: 4,
    },
    loanAmount: {
        color: '#fff',
        fontSize: 44,
        fontWeight: '800',
        fontFamily: 'Courier',
        letterSpacing: -1,
    },

    // CTA
    cta: {
        backgroundColor: ORANGE,
        paddingVertical: 20,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 14,
    },
    ctaDisabled: {
        opacity: 0.35,
    },
    ctaHighlight: {
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
    },
    ctaText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
        fontFamily: 'Courier',
    },
    warning: {
        color: ORANGE,
        fontSize: 12,
        fontFamily: 'Courier',
        textAlign: 'center',
        opacity: 0.7,
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

    // Success
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    successIcon: {
        fontSize: 52,
        color: ORANGE,
    },
    successTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        fontFamily: 'Courier',
        letterSpacing: 2,
    },
    successSub: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontFamily: 'Courier',
    },
});
