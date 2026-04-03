// components/NewsPopup.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';

export function NewsPopup() {
    const { showNewsPopup, currentNews, language, actions } = useGameStore(useShallow(state => ({
        showNewsPopup: state.showNewsPopup,
        currentNews: state.currentNews,
        language: state.language,
        actions: state.actions,
    })));

    if (!showNewsPopup || !currentNews) return null;

    const headline = language === 'pt' ? currentNews.pt : currentNews.en;
    const subject = currentNews.subject.toUpperCase();

    return (
        <TouchableOpacity
            style={styles.popup}
            onPress={() => {
                actions.dismissNewsPopup();
                actions.setActiveApp('news');
            }}
            activeOpacity={0.92}
        >
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>📰</Text>
                </View>
                <Text style={styles.subject}>{subject}</Text>
                <Text style={styles.dismiss}>✕</Text>
            </View>
            <Text style={styles.headline} numberOfLines={3}>{headline}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    popup: {
        position: 'absolute',
        top: 54,
        left: 12,
        right: 12,
        zIndex: 10001,
        backgroundColor: '#111214',
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#dc2626',
        paddingVertical: 12,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    badge: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 14,
    },
    subject: {
        flex: 1,
        color: '#dc2626',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    },
    dismiss: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
    },
    headline: {
        color: '#f0ece4',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    },
});
