// components/NewsScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { useStrings } from '../constants/strings';
import { gameDate } from '../constants/game-data';
import { NewsItem } from '../types/game';

export function NewsScreen() {
    const { newsHistory, language } = useGameStore(useShallow(state => ({
        newsHistory: state.newsHistory,
        language: state.language,
    })));

    const str = useStrings();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>📰</Text>
                <View>
                    <Text style={styles.title}>{str.home.apps.news}</Text>
                    <Text style={styles.subtitle}>Banco Meister Informativo</Text>
                </View>
            </View>
            <View style={styles.divider} />
            <ScrollView contentContainerStyle={styles.list}>
                {newsHistory.length === 0 ? (
                    <Text style={styles.empty}>
                        {language === 'pt' ? 'Nenhuma notícia ainda.' : 'No news yet.'}
                    </Text>
                ) : (
                    newsHistory.map((item, i) => (
                        <NewsRow key={i} item={item} language={language} />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

function NewsRow({ item, language }: { item: NewsItem; language: 'pt' | 'en' }) {
    const headline = language === 'pt' ? item.pt : item.en;
    const subject = item.subject.toUpperCase();
    const date = gameDate(item.day, language);

    return (
        <View style={styles.row}>
            <View style={styles.rowMeta}>
                <Text style={styles.rowSubject}>{subject}</Text>
                <Text style={styles.rowDate}>{date}</Text>
            </View>
            <Text style={styles.rowHeadline}>{headline}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0d0d',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    logo: {
        fontSize: 32,
    },
    title: {
        color: '#f0ece4',
        fontSize: 20,
        fontWeight: '700',
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    },
    subtitle: {
        color: '#dc2626',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
        marginTop: 2,
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    },
    divider: {
        height: 1,
        backgroundColor: '#dc2626',
        marginHorizontal: 20,
        opacity: 0.6,
    },
    list: {
        padding: 20,
        gap: 24,
    },
    empty: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 40,
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    },
    row: {
        gap: 6,
    },
    rowMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowSubject: {
        color: '#dc2626',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.2,
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    },
    rowDate: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    },
    rowHeadline: {
        color: '#f0ece4',
        fontSize: 15,
        lineHeight: 22,
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    },
});
