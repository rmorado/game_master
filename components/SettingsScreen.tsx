// components/SettingsScreen.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { Lang } from '../types/game';

export function SettingsScreen() {
    const { language, actions } = useGameStore(useShallow(s => ({
        language: s.language,
        actions: s.actions,
    })));

    const options: { lang: Lang; label: string }[] = [
        { lang: 'pt', label: 'PT 🇧🇷' },
        { lang: 'en', label: 'EN 🇺🇸' },
    ];

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => actions.setActiveApp('home')} hitSlop={12}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>idioma / language</Text>
            </View>

            <View style={styles.body}>
                {options.map(({ lang, label }) => (
                    <TouchableOpacity
                        key={lang}
                        style={[styles.btn, language === lang && styles.btnActive]}
                        onPress={() => actions.setLanguage(lang)}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.btnText, language === lang && styles.btnTextActive]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0f0f0f',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#1f1f1f',
        gap: 8,
    },
    backArrow: {
        color: '#aaa',
        fontSize: 28,
        lineHeight: 32,
    },
    title: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    body: {
        flexDirection: 'row',
        gap: 16,
        padding: 24,
    },
    btn: {
        flex: 1,
        paddingVertical: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center',
        backgroundColor: '#111',
    },
    btnActive: {
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212,175,55,0.08)',
    },
    btnText: {
        fontSize: 22,
        color: '#555',
        fontWeight: '600',
    },
    btnTextActive: {
        color: '#D4AF37',
    },
});
