// components/PayModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { UI_PAY_MODAL } from '../constants/dialogues';

const formatMoney = (n: number) => {
    if(n >= 1000000) return (n/1000000).toFixed(1) + "M";
    if(n >= 1000) return (n/1000).toFixed(0) + "k";
    return Math.floor(n);
}

export function PayModal() {
    const { clean, batches, actions, modal } = useGameStore(state => state);

    const closeModal = () => {
        actions.setModal('none');
    }

    const confirmPay = () => {
        actions.confirmPay();
    }
    
    const debt = batches[0];
    const canPay = debt ? Math.min(clean, debt.due) : 0;

    return (
        <Modal
            transparent={true}
            visible={modal === 'pay'}
            animationType="slide"
            onRequestClose={closeModal}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.title}>{UI_PAY_MODAL.title}</Text>
                    <Text style={styles.payAmount}>{formatMoney(canPay)}</Text>
                    <Text style={styles.payBalance}>{UI_PAY_MODAL.labelBalance(formatMoney(clean))}</Text>
                    <TouchableOpacity style={styles.confirmBtn} onPress={confirmPay}>
                        <Text style={styles.confirmBtnText}>{UI_PAY_MODAL.btnConfirm}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeModal}>
                        <Text style={styles.cancelLnk}>{UI_PAY_MODAL.btnCancel}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: '#1a1a1a',
        borderTopWidth: 1,
        borderColor: '#444',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        color: '#aaa',
        marginBottom: 10,
    },
    payAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00ff41',
        marginBottom: 5,
    },
    payBalance: {
        fontSize: 12,
        color: '#666',
        marginBottom: 20,
    },
    confirmBtn: {
        width: '100%',
        padding: 15,
        backgroundColor: '#D4AF37',
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 15,
        textTransform: 'uppercase',
    },
    cancelLnk: {
        marginTop: 15,
        color: '#666',
        fontSize: 12,
    },
});
