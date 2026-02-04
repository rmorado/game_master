// components/BankScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';
import { StatusBar } from './StatusBar';
import { Gauge } from './Gauge';
import { MoneyDisplay } from './MoneyDisplay';
import { QueueList } from './QueueList';
import { LEVELS } from '../constants/game-data';
import { UI_BANK } from '../constants/dialogues';

export function BankScreen() {
    const { suspicion, pressure, dirty, cpfs, clean, batches, levelIdx, totalWashed, tutStep, actions } = useGameStore(state => state);
    const lvl = LEVELS[levelIdx];

    // Tutorial logic
    const isTutorial = tutStep < 8;
    const shouldHighlightLoan = tutStep === 6;
    const shouldDisableButtons = isTutorial && tutStep !== 6;

    const openLoanModal = () => {
        actions.setModal('loan');
    }

    const openPayModal = () => {
        actions.setModal('pay');
    }

    return (
        <>
            <StatusBar />
            <View style={styles.dashPanel}>
                <View style={{display:'flex', justifyContent:'space-between', flexDirection: 'row', fontSize:11, color:'#aaa', marginBottom:5}}>
                    <Text style={styles.levelLabel}>NÍVEL {levelIdx + 1}: {lvl.name.toUpperCase()}</Text>
                    <Text style={styles.goalLabel}>META: {totalWashed} / {lvl.goal}</Text>
                </View>
                <Gauge label="SUSPEITA (PF)" value={suspicion} color="#00ff41" />
                <Gauge label="COBRANÇA (CARTEL)" value={pressure} color="#4da6ff" />
            </View>
            <QueueList batches={batches} />
            <MoneyDisplay dirty={dirty} cpfs={cpfs} clean={clean} />
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[
                        styles.bigBtn,
                        shouldHighlightLoan && styles.highlighted,
                        shouldDisableButtons && styles.disabled
                    ]}
                    onPress={openLoanModal}
                    disabled={shouldDisableButtons}
                >
                    <Text style={styles.btnText}>{UI_BANK.btnCreateLoan}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.bigBtn, styles.btnPay, shouldDisableButtons && styles.disabled]}
                    onPress={openPayModal}
                    disabled={shouldDisableButtons}
                >
                    <Text style={styles.btnText}>{UI_BANK.btnPayDebt}</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    dashPanel: {
        padding: 15,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
    },
    levelLabel: {
        fontSize: 11,
        color: '#aaa',
    },
    goalLabel: {
        fontSize: 11,
        color: '#aaa',
    },
    actionRow: {
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        gap: 15,
        backgroundColor: '#000',
        width: '100%',
    },
    bigBtn: {
        flex: 1,
        height: 60,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPay: {
        borderColor: '#005c4b',
        backgroundColor: 'rgba(0, 92, 75, 0.2)',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    highlighted: {
        borderColor: '#00ff41',
        borderWidth: 3,
        backgroundColor: 'rgba(0, 255, 65, 0.1)',
    },
    disabled: {
        opacity: 0.3,
    }
});
