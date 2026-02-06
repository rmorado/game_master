// components/LoanModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { LEVELS } from '../constants/game-data';
import { UI_LOAN_MODAL } from '../constants/dialogues';

export function LoanModal() {
    const { levelIdx, selectedLoanSize, actions, modal, cpfs } = useGameStore(state => state);

    const closeModal = () => {
        actions.setModal('none');
    }

    const selectBatch = (size: number) => {
        actions.setSelectedLoanSize(size);
    }

    const confirmLoan = () => {
        actions.confirmLoan();
    }

    return (
        <Modal
            transparent={true}
            visible={modal === 'loan'}
            animationType="slide"
            onRequestClose={closeModal}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.title}>{UI_LOAN_MODAL.title}</Text>
                    <View style={styles.presetRow}>
                        {[10, 50, 100].map(size => {
                            const isLocked = cpfs < size;
                            return (
                                <TouchableOpacity
                                    key={size}
                                    style={[
                                        styles.selBtn,
                                        isLocked && styles.locked,
                                        size === selectedLoanSize && styles.selected
                                    ]}
                                    onPress={() => selectBatch(size)}
                                    disabled={isLocked}
                                >
                                    <Text style={styles.btnText}>{size}</Text>
                                    <Text style={styles.subText}>{UI_LOAN_MODAL.labelIds}</Text>
                                    <Text style={styles.smallText}>{UI_LOAN_MODAL.labelDirtyCost(size * 5)}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <TouchableOpacity style={styles.confirmBtn} onPress={confirmLoan}>
                        <Text style={styles.confirmBtnText}>{UI_LOAN_MODAL.btnConfirm}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeModal}>
                        <Text style={styles.cancelLnk}>{UI_LOAN_MODAL.btnCancel}</Text>
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
    presetRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        marginVertical: 20,
    },
    selBtn: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        alignItems: 'center',
    },
    locked: {
        opacity: 0.3,
    },
    selected: {
        borderColor: '#D4AF37',
        backgroundColor: '#222',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
    },
    subText: {
        color: 'white',
    },
    smallText: {
        fontSize: 10,
        color: '#aaa'
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
