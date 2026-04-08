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
import { AUCTION_DURATIONS } from '../constants/game-data';
import { useStrings } from '../constants/strings';
import { formatMoney } from '../utils/format';

const BLUE = '#1d4ed8';
const PURPLE = '#7c3aed';

type SellStep = 'list' | 'offers';

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
    const str = useStrings();
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
                    <Text style={offerStyles.bestBadgeText}>{str.bacen.bestOffer}</Text>
                </View>
            )}
            <View style={offerStyles.cardHeader}>
                <View style={offerStyles.bankIcon}>
                    <Text style={offerStyles.bankIconText}>{str.bacen.bankIcon}</Text>
                </View>
                <Text style={offerStyles.bankName}>{bankName}</Text>
                <View style={offerStyles.discountBadge}>
                    <Text style={offerStyles.discountText}>-{(discountRate * 100).toFixed(0)}%</Text>
                </View>
            </View>
            <View style={offerStyles.cardBody}>
                <Text style={offerStyles.offerLabel}>{str.bacen.offerLabel}</Text>
                <Text style={offerStyles.offerValue}>R$ {formatMoney(offerValue)}</Text>
            </View>
            <TouchableOpacity style={offerStyles.acceptBtn} onPress={onAccept} activeOpacity={0.8}>
                <Text style={offerStyles.acceptBtnText}>{str.bacen.confirmBtn}</Text>
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
        borderColor: BLUE,
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
        backgroundColor: BLUE,
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
    const { debtPacks, pendingAuctions, completedAuctions, currentSellPackId, bankOffers, day, tutStep, actions } =
        useGameStore(useShallow(s => ({
            debtPacks: s.debtPacks,
            pendingAuctions: s.pendingAuctions,
            completedAuctions: s.completedAuctions,
            currentSellPackId: s.currentSellPackId,
            bankOffers: s.bankOffers,
            day: s.day,
            tutStep: s.tutStep,
            actions: s.actions,
        })));

    const str = useStrings();
    const [auctionPickerPackId, setAuctionPickerPackId] = useState<number | null>(null);
    const [sellStep, setSellStep] = useState<SellStep>(
        currentSellPackId && bankOffers.length > 0 ? 'offers' : 'list'
    );
    const [successPackId, setSuccessPackId] = useState<number | null>(null);
    const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // When offers are claimed from store, transition to offers view
    useEffect(() => {
        if (currentSellPackId && bankOffers.length > 0 && sellStep !== 'offers') {
            setSellStep('offers');
        }
    }, [currentSellPackId, bankOffers.length]);

    useEffect(() => {
        return () => {
            if (successTimer.current) clearTimeout(successTimer.current);
        };
    }, []);

    const handleStartAuction = (packId: number, days: number, minPct: number, maxPct: number) => {
        actions.startAuction(packId, days, minPct, maxPct);
        setAuctionPickerPackId(null);
    };

    const handleClaim = (packId: number) => {
        actions.claimAuction(packId);
    };

    const handleAcceptOffer = (offerValue: number) => {
        if (!currentSellPackId) return;
        const packId = currentSellPackId;
        setSuccessPackId(packId);
        setSellStep('list');
        actions.sellDebtPack(packId, offerValue);
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
                        <Text style={styles.wordmark}>{str.bacen.wordmark}</Text>
                        <Text style={styles.subtitle}>{str.bacen.subtitle}</Text>
                    </View>
                </View>
                <View style={styles.corpBadge}>
                    <Text style={styles.corpText}>{str.bacen.corpBadge}</Text>
                </View>
            </View>

            {/* Body */}
            <View style={styles.body}>
                {sellStep === 'offers' ? (
                    // ── Offers ─────────────────────────────────────────────────
                    <ScrollView contentContainerStyle={styles.section} showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionLabel}>{str.bacen.sectionOffers}</Text>
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
                            onPress={() => { actions.cancelOffers(); setSellStep('list'); }}
                        >
                            <Text style={styles.cancelLinkText}>{str.bacen.cancelLink}</Text>
                        </TouchableOpacity>
                    </ScrollView>

                ) : successPackId ? (
                    // ── Success ────────────────────────────────────────────────
                    <View style={styles.successContainer}>
                        <Text style={styles.successIcon}>{str.bacen.successIcon}</Text>
                        <Text style={styles.successTitle}>{str.bacen.successTitle}</Text>
                        <Text style={styles.successSub}>{str.bacen.successSub}</Text>
                    </View>

                ) : (
                    // ── Pack list ──────────────────────────────────────────────
                    <ScrollView style={styles.packList} showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionLabel}>{str.bacen.sectionPackList}</Text>
                        {debtPacks.length === 0 ? (
                            <Text style={styles.emptyText}>{str.bacen.emptyPacks}</Text>
                        ) : (
                            debtPacks.map(pack => {
                                const pending = pendingAuctions.find(a => a.packId === pack.id);
                                const completed = completedAuctions.find(a => a.packId === pack.id);
                                const showPicker = auctionPickerPackId === pack.id;
                                const showHighlight = tutStep === 11 && !pending && !completed && !showPicker;

                                return (
                                    <View key={pack.id} style={styles.packCard}>
                                        {/* Pack info row */}
                                        <View style={styles.packRow}>
                                            <View style={styles.packIdBadge}>
                                                <Text style={styles.packIdText}>#{pack.id % 10000}</Text>
                                            </View>
                                            <View style={styles.packInfo}>
                                                <Text style={styles.packName}>{str.bacen.packName(pack.cpfsUsed)}</Text>
                                                <Text style={styles.packMeta}>{str.bacen.packMeta(pack.dayCreated)}</Text>
                                            </View>
                                            <View style={styles.packRight}>
                                                <Text style={styles.packValue}>R$ {formatMoney(pack.value)}</Text>
                                            </View>
                                        </View>

                                        {/* Auction state */}
                                        {showPicker ? (
                                            <View style={styles.picker}>
                                                <Text style={styles.pickerHint}>{str.bacen.auctionPick}</Text>
                                                {AUCTION_DURATIONS.map(dur => (
                                                    <TouchableOpacity
                                                        key={dur.label}
                                                        style={styles.durationBtn}
                                                        onPress={() => handleStartAuction(pack.id, dur.days, dur.minPct, dur.maxPct)}
                                                        activeOpacity={0.75}
                                                    >
                                                        <Text style={styles.durationLabel}>{dur.label}</Text>
                                                        <Text style={styles.durationDays}>{str.bacen.packDays(dur.days)}</Text>
                                                        <Text style={styles.durationRange}>{Math.round(dur.minPct * 100)}–{Math.round(dur.maxPct * 100)}%</Text>
                                                    </TouchableOpacity>
                                                ))}
                                                <TouchableOpacity
                                                    style={styles.cancelPicker}
                                                    onPress={() => setAuctionPickerPackId(null)}
                                                >
                                                    <Text style={styles.cancelPickerText}>{str.bacen.cancelLink}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : pending ? (
                                            <View style={styles.pendingBadge}>
                                                <Text style={styles.pendingText}>
                                                    {str.bacen.auctionPending(Math.max(0, pending.endDay - day))}
                                                </Text>
                                            </View>
                                        ) : completed ? (
                                            <TouchableOpacity
                                                style={styles.claimBtn}
                                                onPress={() => handleClaim(pack.id)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.claimBtnText}>{str.bacen.auctionReady}</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.startBtn, showHighlight && styles.startBtnHighlight]}
                                                onPress={() => {
                                                    if (tutStep === 11) {
                                                        const dur = AUCTION_DURATIONS[1];
                                                        handleStartAuction(pack.id, dur.days, dur.minPct, dur.maxPct);
                                                    } else {
                                                        setAuctionPickerPackId(pack.id);
                                                    }
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.startBtnText}>{str.bacen.auctionStart}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
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
        color: BLUE,
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

    // Pack card
    packCard: {
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
    },
    packRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
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
    },
    packValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        fontFamily: 'Courier',
    },

    // Auction picker
    picker: {
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        padding: 12,
        gap: 8,
    },
    pickerHint: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        fontFamily: 'Courier',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    durationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(29,78,216,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(29,78,216,0.3)',
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    durationLabel: {
        flex: 1,
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Courier',
        fontWeight: '600',
    },
    durationDays: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 12,
        fontFamily: 'Courier',
    },
    durationRange: {
        color: '#60a5fa',
        fontSize: 12,
        fontFamily: 'Courier',
        fontWeight: '700',
    },
    cancelPicker: {
        paddingVertical: 6,
        alignItems: 'center',
    },
    cancelPickerText: {
        color: 'rgba(255,255,255,0.25)',
        fontSize: 12,
        fontFamily: 'Courier',
    },

    // Pending badge
    pendingBadge: {
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    pendingText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 12,
        fontFamily: 'Courier',
        letterSpacing: 0.3,
    },

    // Claim button
    claimBtn: {
        borderTopWidth: 1,
        borderColor: 'rgba(124,58,237,0.4)',
        backgroundColor: 'rgba(124,58,237,0.12)',
        paddingVertical: 12,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    claimBtnText: {
        color: '#a78bfa',
        fontSize: 12,
        fontFamily: 'Courier',
        fontWeight: '700',
        letterSpacing: 1,
    },

    // Start auction button
    startBtn: {
        borderTopWidth: 1,
        borderColor: 'rgba(29,78,216,0.3)',
        paddingVertical: 11,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    startBtnHighlight: {
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 6,
    },
    startBtnText: {
        color: '#60a5fa',
        fontSize: 12,
        fontFamily: 'Courier',
        fontWeight: '600',
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
        color: BLUE,
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
