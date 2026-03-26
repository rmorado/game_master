import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../hooks/use-game-store';
import { useShallow } from 'zustand/react/shallow';

const APP_META: Record<string, { label: string; accent: string; bg: string }> = {
    home:     { label: 'Início',   accent: '#D4AF37', bg: '#1a1a2e' },
    zep:      { label: 'ZEP',      accent: '#22c55e', bg: '#0f1f14' },
    chat:     { label: 'Chat',     accent: '#22c55e', bg: '#0b141a' },
    laranjas: { label: 'Laranjas', accent: '#ff6a00', bg: '#1a0800' },
    bacen:    { label: 'BACEN',    accent: '#7c3aed', bg: '#0b0118' },
    carteira: { label: 'Carteira', accent: '#22c55e', bg: '#060f06' },
};

export function AppOverview() {
    const { showAppOverview, visitedApps, activeApp, actions } = useGameStore(useShallow(s => ({
        showAppOverview: s.showAppOverview,
        visitedApps: s.visitedApps,
        activeApp: s.activeApp,
        actions: s.actions,
    })));
    const insets = useSafeAreaInsets();

    if (!showAppOverview) return null;

    const navBarHeight = 56 + Math.max(insets.bottom, 8);

    const goTo = (app: string) => {
        actions.setActiveApp(app as any);
    };

    return (
        <View style={[styles.overlay, { bottom: navBarHeight }]}>
            {/* Tap outside to dismiss */}
            <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={actions.toggleAppOverview} />

            <View style={styles.grid}>
                {visitedApps.map(appId => {
                    const meta = APP_META[appId];
                    if (!meta) return null;
                    const isActive = appId === activeApp;
                    return (
                        <TouchableOpacity
                            key={appId}
                            style={[styles.card, { backgroundColor: meta.bg }, isActive && { borderColor: meta.accent, borderWidth: 2 }]}
                            onPress={() => goTo(appId)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.cardBar, { backgroundColor: meta.accent }]} />
                            <Text style={[styles.cardLabel, { color: meta.accent }]}>{meta.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
        padding: 20,
        paddingBottom: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'flex-start',
    },
    card: {
        width: '30%',
        aspectRatio: 0.65,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        justifyContent: 'flex-end',
        padding: 8,
    },
    cardBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    cardLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
