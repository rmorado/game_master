// components/SellDebtModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    ScrollView,
} from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { UI_SELL } from '../constants/dialogues';

const formatMoney = (n: number) => {
    if (n >= 1000000) return 'R$ ' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return 'R$ ' + (n / 1000).toFixed(0) + 'k';
    return 'R$ ' + Math.floor(n).toLocaleString('pt-BR');
};

interface BankCardProps {
    bankName: string;
    discountRate: number;
    offerValue: number;
    onAccept: () => void;
    isSelected: boolean;
    index: number;
}

const BankCard = ({ bankName, discountRate, offerValue, onAccept, isSelected, index }: BankCardProps) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 150,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                delay: index * 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.bankCard, isSelected && styles.bankCardSelected, { opacity: fadeAnim, transform: [{ translateY }] }]}>
            <View style={styles.bankCardHeader}>
                <Text style={styles.bankIcon}>🏦</Text>
                <Text style={styles.bankName}>{bankName}</Text>
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{(discountRate * 100).toFixed(0)}%</Text>
                </View>
            </View>
            <View style={styles.bankCardBody}>
                <Text style={styles.offerLabel}>Oferta</Text>
                <Text style={styles.offerValue}>{formatMoney(offerValue)}</Text>
            </View>
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
                <Text style={styles.acceptBtnText}>{UI_SELL.accept}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export function SellDebtModal() {
    const { modal, debtPacks, currentSellPackId, bankOffers, actions } = useGameStore(state => state);
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const successAnim = useRef(new Animated.Value(0)).current;

    const visible = modal === 'sell';
    const pack = debtPacks.find(p => p.id === currentSellPackId);

    const handleAccept = (offerValue: number, bankName: string) => {
        if (!currentSellPackId || isComplete) return;
        setSelectedBank(bankName);
        setIsComplete(true);

        Animated.spring(successAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            actions.sellDebtPack(currentSellPackId, offerValue);
            setSelectedBank(null);
            setIsComplete(false);
        }, 1800);
    };

    const handleClose = () => {
        if (isComplete) return;
        actions.setModal('none');
    };

    // Reset when modal closes
    useEffect(() => {
        if (!visible) {
            setSelectedBank(null);
            setIsComplete(false);
        }
    }, [visible]);

    if (!pack && !isComplete) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {isComplete ? (
                        <Animated.View style={[styles.successContainer, { opacity: successAnim, transform: [{ scale: successAnim }] }]}>
                            <Text style={styles.successTitle}>{UI_SELL.successTitle}</Text>
                            <Text style={styles.successSub}>{UI_SELL.successSub}</Text>
                            {selectedBank && (
                                <Text style={styles.successBank}>via {selectedBank}</Text>
                            )}
                        </Animated.View>
                    ) : (
                        <>
                            <View style={styles.header}>
                                <Text style={styles.title}>{UI_SELL.title}</Text>
                                <Text style={styles.subtitle}>{UI_SELL.subtitle}</Text>
                            </View>

                            <View style={styles.packInfo}>
                                <Text style={styles.packInfoLabel}>{UI_SELL.faceValue}</Text>
                                <Text style={styles.packInfoValue}>{formatMoney(pack!.value)}</Text>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} style={styles.bankList}>
                                {bankOffers.map((offer, i) => (
                                    <BankCard
                                        key={offer.bankName}
                                        bankName={offer.bankName}
                                        discountRate={offer.discountRate}
                                        offerValue={offer.offerValue}
                                        onAccept={() => handleAccept(offer.offerValue, offer.bankName)}
                                        isSelected={selectedBank === offer.bankName}
                                        index={i}
                                    />
                                ))}
                            </ScrollView>

                            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>{UI_SELL.cancel}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#0f0f0f',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderColor: '#222',
        padding: 24,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    subtitle: {
        color: '#666',
        fontSize: 13,
    },
    packInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
        padding: 14,
        marginBottom: 16,
    },
    packInfoLabel: {
        color: '#aaa',
        fontSize: 13,
    },
    packInfoValue: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Courier',
    },
    bankList: {
        marginBottom: 16,
    },
    bankCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        padding: 16,
        marginBottom: 10,
    },
    bankCardSelected: {
        borderColor: '#00ff41',
        backgroundColor: 'rgba(0,255,65,0.05)',
    },
    bankCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    bankIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    bankName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    discountBadge: {
        backgroundColor: 'rgba(255,59,48,0.15)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#ff3b30',
    },
    discountText: {
        color: '#ff3b30',
        fontSize: 11,
        fontWeight: 'bold',
    },
    bankCardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    offerLabel: {
        color: '#aaa',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    offerValue: {
        color: '#00ff41',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Courier',
    },
    acceptBtn: {
        backgroundColor: '#00ff41',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    acceptBtnText: {
        color: '#000',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    closeBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    closeBtnText: {
        color: '#555',
        fontSize: 13,
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    successTitle: {
        color: '#00ff41',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    successSub: {
        color: '#aaa',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    successBank: {
        color: '#555',
        fontSize: 12,
        textAlign: 'center',
    },
});
