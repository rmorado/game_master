// components/DebugMenu.tsx
// ⚠️  DEV ONLY — never ships. Rendered only when __DEV__ === true.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useGameStore } from '../hooks/use-game-store';

export function DebugMenu() {
    const [visible, setVisible] = useState(false);
    const { actions, debugNoCooldowns } = useGameStore(s => ({ actions: s.actions, debugNoCooldowns: s.debugNoCooldowns }));

    if (!__DEV__) return null;

    const btn = (label: string, onPress: () => void, color = '#f59e0b') => (
        <TouchableOpacity style={[styles.btn, { borderColor: color }]} onPress={() => { onPress(); setVisible(false); }}>
            <Text style={[styles.btnText, { color }]}>{label}</Text>
        </TouchableOpacity>
    );

    const toggle = (label: string, active: boolean, onPress: () => void) => (
        <TouchableOpacity style={[styles.btn, { borderColor: active ? '#22c55e' : '#444' }]} onPress={onPress}>
            <Text style={[styles.btnText, { color: active ? '#22c55e' : '#666' }]}>{label} {active ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
    );

    return (
        <>
            <TouchableOpacity
                style={styles.island}
                onLongPress={() => setVisible(true)}
                delayLongPress={800}
                activeOpacity={1}
            />
            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setVisible(false)}>
                    <View style={styles.menu} onStartShouldSetResponder={() => true}>
                        <Text style={styles.title}>⚙ DEBUG</Text>

                        <Text style={styles.sectionLabel}>LEVEL</Text>
                        {btn('→ Gerente (1)',  () => actions.debugForceLevel(1))}
                        {btn('→ Doleiro (2)',  () => actions.debugForceLevel(2))}
                        {btn('→ O Mestre (3)', () => actions.debugForceLevel(3))}

                        <Text style={styles.sectionLabel}>RESOURCES</Text>
                        {btn('+500M Sujo',  () => actions.debugAddResources(500_000_000, 0, 0),       '#f97316')}
                        {btn('+100M Limpo', () => actions.debugAddResources(0, 100_000_000, 0),       '#22c55e')}
                        {btn('+10k CPFs',   () => actions.debugAddResources(0, 0, 10_000),            '#a78bfa')}

                        <Text style={styles.sectionLabel}>FLAGS</Text>
                        {toggle('No Cooldowns', debugNoCooldowns, actions.debugToggleNoCooldowns)}

                        <Text style={styles.sectionLabel}>TUTORIAL</Text>
                        {btn('Skip Tutorial', () => actions.skipTutorial(), '#64748b')}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    island: {
        alignSelf: 'center',
        marginTop: 12,
        width: 120,
        height: 34,
        backgroundColor: '#050505',
        borderRadius: 20,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menu: {
        backgroundColor: '#0d1117',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f59e0b44',
        padding: 20,
        width: 260,
        gap: 8,
    },
    title: {
        color: '#f59e0b',
        fontFamily: 'Courier',
        fontWeight: '700',
        fontSize: 13,
        letterSpacing: 2,
        marginBottom: 4,
        textAlign: 'center',
    },
    sectionLabel: {
        color: 'rgba(255,255,255,0.25)',
        fontFamily: 'Courier',
        fontSize: 9,
        letterSpacing: 2,
        marginTop: 8,
    },
    btn: {
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    btnText: {
        fontFamily: 'Courier',
        fontSize: 13,
        fontWeight: '700',
    },
});
