// components/BacenScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { UI_BACEN } from '../constants/dialogues';
import { formatMoney } from '../utils/format';

type SellStep = 'list' | 'loading' | 'offers';

// ─── Bank loading row ─────────────────────────────────────────────────────────

function BankLoadRow({ name, delay, onReady }: { name: string; delay: number; onReady?: () => void }) {
    const [ready, setReady] = useState(false);
    const fade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const t = setTimeout(() => {
            setReady(true);
            Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            onReady?.();
        }, delay);
        return () => clearTimeout(t);
    }, []);

    return (
        <Animated.View style={[loadStyles.row, { opacity: ready ? 1 : 0.2 }]}>
            <View style={loadStyles.bankDot} />
            <Text style={loadStyles.bankName}>{name}</Text>
            {ready ? (
                <Text style={loadStyles.readyText}>{UI_BACEN.bankReady}</Text>
            ) : (
                <Text style={loadStyles.waitText}>{UI_BACEN.bankWaiting}</Text>
            )}
        </Animated.View>
    );
}

const loadStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: 'rgba(29,78,216,0.15)',
        gap: 12,
    },
    bankDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1d4ed8',
    },
    bankName: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    readyText: {
        fontSize: 11,
        color: '#60a5fa',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    waitText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.25)',
    },
});

// ─── Offer card ───────────────────────────────────────────────────────────────

interface OfferCardProps {
    bankName: string;
    discountRate: number;
    offerValue: number;
    isBest: boolean;
    index: number;
    onAccept: () => void;
}

function OfferCard({ bankName, discountRate, offerValue, isBest, index, onAccept }: OfferCardProps) {
    const slide = useRef(new Animated.Value(30)).current;
    const fade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 350, delay: index * 120, useNativeDriver: true }),
            Animated.timing(slide, { toValue: 0, duration: 350, delay: index * 120, useNativeDriver: true }),
        ]).start();
    }, [index]);

    return (
        <Animated.View style={[offerStyles.card, isBest && offerStyles.cardBest, { opacity: fade, transform: [{ translateY: slide }] }]}>
            {isBest && (
                <View style={offerStyles.bestBadge}>
                    <Text style={offerStyles.bestBadgeText}>{UI_BACEN.bestOffer}</Text>
                </View>
            )}
            <View style={offerStyles.cardHeader}>
                <View style={offerStyles.bankIcon}>
                    <Text style={offerStyles.bankIconText}>{UI_BACEN.bankIcon}</Text>
                </View>
                <Text style={offerStyles.bankName}>{bankName}</Text>
                <View style={offerStyles.discountBadge}>
                    <Text style={offerStyles.discountText}>-{(discountRate * 100).toFixed(0)}%</Text>
                </View>
            </View>
            <View style={offerStyles.cardBody}>
                <Text style={offerStyles.offerLabel}>{UI_BACEN.offerLabel}</Text>
                <Text style={offerStyles.offerValue}>R$ {formatMoney(offerValue)}</Text>
            </View>
            <TouchableOpacity style={offerStyles.acceptBtn} onPress={onAccept} activeOpacity={0.8}>
                <Text style={offerStyles.acceptBtnText}>{UI_BACEN.confirmBtn}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const offerStyles = StyleSheet.create({
    card: {
        backgroundColor: '#0a1628',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(29,78,216,0.25)',
        padding: 16,
        marginBottom: 12,
    },
    cardBest: {
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(29,78,216,0.08)',
    },
    bestBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(29,78,216,0.25)',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginBottom: 10,
    },
    bestBadgeText: {
        color: '#60a5fa',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    bankIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(29,78,216,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bankIconText: { fontSize: 16 },
    bankName: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    discountBadge: {
        backgroundColor: 'rgba(248,113,113,0.15)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.4)',
    },
    discountText: {
        color: '#f87171',
        fontSize: 11,
        fontWeight: '700',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    offerLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    offerValue: {
        color: '#60a5fa',
        fontSize: 22,
        fontWeight: '700',
        fontFamily: 'Courier',
    },
    acceptBtn: {
        backgroundColor: '#1d4ed8',
        borderRadius: 8,
        paddingVertical: 13,
        alignItems: 'center',
    },
    acceptBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
    },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export function BacenScreen() {
    const { debtPacks, currentSellPackId, bankOffers, tutStep, actions } =
        useGameStore(useShallow(s => ({
            debtPacks: s.debtPacks,
            currentSellPackId: s.currentSellPackId,
            bankOffers: s.bankOffers,
            tutStep: s.tutStep,
            actions: s.actions,
        })));

    const [selectedPackId, setSelectedPackId] = useState<number | null>(currentSellPackId);
    const [sellStep, setSellStep] = useState<SellStep>(
        currentSellPackId && bankOffers.length > 0 ? 'loading' : 'list'
    );
    const [successPackId, setSuccessPackId] = useState<number | null>(null);
    const offerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Arrived from openSellModal with pre-selected pack — transition to offers after loading
        if (currentSellPackId && bankOffers.length > 0 && sellStep === 'loading') {
            offerTimer.current = setTimeout(() => setSellStep('offers'), 2500);
        }
        return () => {
            if (offerTimer.current) clearTimeout(offerTimer.current);
            if (successTimer.current) clearTimeout(successTimer.current);
        };
    }, []);

    const handleOfferPack = () => {
        if (!selectedPackId) return;
        actions.openSellModal(selectedPackId);
        setSellStep('loading');
        if (offerTimer.current) clearTimeout(offerTimer.current);
        offerTimer.current = setTimeout(() => setSellStep('offers'), 2500);
    };

    const handleAcceptOffer = (offerValue: number) => {
        if (!currentSellPackId && !selectedPackId) return;
        const packId = currentSellPackId ?? selectedPackId!;
        setSuccessPackId(packId);
        setSellStep('list');
        setSelectedPackId(null);

        actions.sellDebtPack(packId, offerValue);
        // sellDebtPack navigates to 'home'; stay in BACEN to show success state briefly
        if (successTimer.current) clearTimeout(successTimer.current);
        successTimer.current = setTimeout(() => {
            actions.setActiveApp('bacen');
            setSuccessPackId(null);
        }, 1800);
    };

    const bestOfferIdx = bankOffers.length
        ? bankOffers.reduce((best, o, i) => o.offerValue > bankOffers[best].offerValue ? i : best, 0)
        : -1;

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLogo}>
                    <View style={styles.logoMark}>
                        <Text style={styles.logoLetter}>B</Text>
                    </View>
                    <View>
                        <Text style={styles.wordmark}>{UI_BACEN.wordmark}</Text>
                        <Text style={styles.subtitle}>{UI_BACEN.subtitle}</Text>
                    </View>
                </View>
                <View style={styles.corpBadge}>
                    <Text style={styles.corpText}>{UI_BACEN.corpBadge}</Text>
                </View>
            </View>

            {/* Body */}
            <View style={styles.body}>
                    {sellStep === 'loading' ? (
                        // ── Loading state ──────────────────────────────────────
                        <ScrollView contentContainerStyle={styles.section}>
                            <Text style={styles.sectionLabel}>{UI_BACEN.sectionLoading}</Text>
                            <Text style={styles.loadingHint}>{UI_BACEN.loadingHint}</Text>
                            {bankOffers.map((offer, i) => (
                                <BankLoadRow
                                    key={offer.bankName}
                                    name={offer.bankName}
                                    delay={700 + i * 700}
                                />
                            ))}
                        </ScrollView>

                    ) : sellStep === 'offers' ? (
                        // ── Offers state ───────────────────────────────────────
                        <ScrollView contentContainerStyle={styles.section} showsVerticalScrollIndicator={false}>
                            <Text style={styles.sectionLabel}>{UI_BACEN.sectionOffers}</Text>
                            {bankOffers.map((offer, i) => (
                                <OfferCard
                                    key={offer.bankName}
                                    bankName={offer.bankName}
                                    discountRate={offer.discountRate}
                                    offerValue={offer.offerValue}
                                    isBest={i === bestOfferIdx}
                                    index={i}
                                    onAccept={() => handleAcceptOffer(offer.offerValue)}
                                />
                            ))}
                            <TouchableOpacity
                                style={styles.cancelLink}
                                onPress={() => setSellStep('list')}
                            >
                                <Text style={styles.cancelLinkText}>{UI_BACEN.cancelLink}</Text>
                            </TouchableOpacity>
                        </ScrollView>

                    ) : successPackId ? (
                        // ── Success state ──────────────────────────────────────
                        <View style={styles.successContainer}>
                            <Text style={styles.successIcon}>{UI_BACEN.successIcon}</Text>
                            <Text style={styles.successTitle}>{UI_BACEN.successTitle}</Text>
                            <Text style={styles.successSub}>{UI_BACEN.successSub}</Text>
                        </View>

                    ) : (
                        // ── Pack list ──────────────────────────────────────────
                        <>
                            <ScrollView style={styles.packList} showsVerticalScrollIndicator={false}>
                                <Text style={styles.sectionLabel}>{UI_BACEN.sectionPackList}</Text>
                                {debtPacks.length === 0 ? (
                                    <Text style={styles.emptyText}>{UI_BACEN.emptyPacks}</Text>
                                ) : (
                                    debtPacks.map(pack => (
                                        <TouchableOpacity
                                            key={pack.id}
                                            style={[styles.packRow, selectedPackId === pack.id && styles.packRowSelected]}
                                            onPress={() => setSelectedPackId(pack.id === selectedPackId ? null : pack.id)}
                                            activeOpacity={0.7}
                                        >
                                            {selectedPackId === pack.id && <View style={styles.packSelectedBar} />}
                                            <View style={styles.packIdBadge}>
                                                <Text style={styles.packIdText}>#{pack.id % 10000}</Text>
                                            </View>
                                            <View style={styles.packInfo}>
                                                <Text style={styles.packName}>{UI_BACEN.packName(pack.cpfsUsed)}</Text>
                                                <Text style={styles.packMeta}>{UI_BACEN.packMeta(pack.dayCreated)}</Text>
                                            </View>
                                            <View style={styles.packRight}>
                                                <Text style={styles.packValue}>R$ {formatMoney(pack.value)}</Text>
                                                <Text style={styles.packDays}>{UI_BACEN.packDays(90 - pack.dayCreated)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>

                            <View style={styles.offerBar}>
                                <TouchableOpacity
                                    style={[
                                        styles.offerBtn,
                                        (!selectedPackId || (tutStep < 7 && tutStep !== 0)) && styles.offerBtnDisabled,
                                        tutStep === 7 && styles.offerBtnHighlight,
                                    ]}
                                    onPress={handleOfferPack}
                                    disabled={!selectedPackId}
                                >
                                    <Text style={styles.offerBtnText}>{UI_BACEN.offerBtn}</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#060e1f',
    },
    header: {
        backgroundColor: '#0d1530',
        borderBottomWidth: 1,
        borderColor: '#1e3a7a',
        paddingTop: 14,
        paddingBottom: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerLogo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoMark: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f59e0b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoLetter: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1d4ed8',
    },
    wordmark: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    corpBadge: {
        backgroundColor: 'rgba(29,78,216,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(29,78,216,0.4)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    corpText: {
        color: '#60a5fa',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    body: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    loadingHint: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 13,
        marginBottom: 20,
        textAlign: 'center',
    },
    packList: {
        flex: 1,
        padding: 16,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.25)',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 30,
    },
    packRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        gap: 12,
        position: 'relative',
        borderRadius: 4,
    },
    packRowSelected: {
        backgroundColor: 'rgba(29,78,216,0.08)',
        borderColor: 'rgba(29,78,216,0.2)',
        borderWidth: 1,
    },
    packSelectedBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: '#1d4ed8',
        borderRadius: 2,
    },
    packIdBadge: {
        width: 42,
        height: 42,
        borderRadius: 8,
        backgroundColor: 'rgba(29,78,216,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(29,78,216,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    packIdText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#60a5fa',
        letterSpacing: 0.5,
    },
    packInfo: {
        flex: 1,
    },
    packName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 3,
    },
    packMeta: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
    },
    packRight: {
        alignItems: 'flex-end',
        gap: 3,
    },
    packValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        fontFamily: 'Courier',
    },
    packDays: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
    },
    offerBar: {
        padding: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: '#1e3a7a',
        gap: 8,
    },
    offerBtn: {
        backgroundColor: '#1d4ed8',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    offerBtnHighlight: {
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 12,
        elevation: 8,
    },
    offerBtnDisabled: {
        opacity: 0.3,
    },
    offerBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cancelLink: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelLinkText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 13,
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
        color: '#1d4ed8',
    },
    successTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 2,
    },
    successSub: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
    },
});
