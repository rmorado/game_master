import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';

export function BottomNavBar() {
    const { actions, navHistory, showAppOverview, tutStep } = useGameStore(useShallow(s => ({
        actions: s.actions,
        navHistory: s.navHistory,
        showAppOverview: s.showAppOverview,
        tutStep: s.tutStep,
    })));
    const insets = useSafeAreaInsets();
    const canGoBack = navHistory.length > 0;

    return (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            {/* Square — recent apps */}
            <TouchableOpacity style={styles.btn} onPress={actions.toggleAppOverview} activeOpacity={0.6}>
                <View style={[styles.square, showAppOverview && styles.activeIcon]} />
            </TouchableOpacity>

            {/* Circle — home */}
            <TouchableOpacity style={styles.btn} onPress={() => actions.setActiveApp('home')} activeOpacity={0.6}>
                <View style={styles.circle} />
            </TouchableOpacity>

            {/* Triangle — back */}
            <TouchableOpacity style={styles.btn} onPress={actions.goBack} activeOpacity={0.6}>
                <View style={[styles.triangle, !canGoBack && styles.dimmed, tutStep === 5 && styles.highlighted]} />
            </TouchableOpacity>
        </View>
    );
}

const ICON_COLOR = 'rgba(255,255,255,0.8)';
const ICON_DIM   = 'rgba(255,255,255,0.25)';
const ICON_SIZE  = 20;

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        backgroundColor: '#0a0a0a',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.08)',
        paddingTop: 20,
    },
    btn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 0,
        minHeight: 0,
    },
    square: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: 3,
        borderWidth: 2,
        borderColor: ICON_COLOR,
    },
    activeIcon: {
        borderColor: '#D4AF37',
    },
    circle: {
        width: ICON_SIZE + 2,
        height: ICON_SIZE + 2,
        borderRadius: (ICON_SIZE + 2) / 2,
        borderWidth: 2,
        borderColor: ICON_COLOR,
    },
    triangle: {
        width: 0,
        height: 0,
        borderTopWidth: (ICON_SIZE - 2) / 2,
        borderBottomWidth: (ICON_SIZE - 2) / 2,
        borderRightWidth: ICON_SIZE - 2,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: ICON_COLOR,
    },
    dimmed: {
        borderRightColor: ICON_DIM,
    },
    highlighted: {
        borderRightColor: '#fff',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 6,
    },
});
