// components/HomeScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Image,
    ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/use-game-store';
import { UI_HOME, TUTORIAL } from '../constants/dialogues';

// ─── App icon ─────────────────────────────────────────────────────────────────

const ZEP_ICON = require('../assets/images/zep-icon.png') as ImageSourcePropType;

interface AppIconProps {
    label: string;
    gradient?: readonly [string, string];
    image?: ImageSourcePropType;
    emoji?: string;
    letter?: string;
    letterColor?: string;
    badge?: number;
    onPress: () => void;
    highlight?: boolean;
    dim?: boolean;
}

function AppIcon({ label, gradient, image, emoji, letter, letterColor, badge, onPress, highlight, dim }: AppIconProps) {
    return (
        <TouchableOpacity
            style={[styles.appItem, dim && styles.appDim]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[styles.iconWrapper, highlight && styles.iconHighlight]}>
                {image ? (
                    <Image source={image} style={styles.iconGradient} resizeMode="cover" />
                ) : (
                    <LinearGradient
                        colors={gradient!}
                        start={{ x: 0.2, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconGradient}
                    >
                        {/* shine overlay */}
                        <LinearGradient
                            colors={['rgba(255,255,255,0.18)', 'transparent']}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                        {emoji ? (
                            <Text style={styles.iconEmoji}>{emoji}</Text>
                        ) : (
                            <Text style={[styles.iconLetter, letterColor ? { color: letterColor } : undefined]}>{letter}</Text>
                        )}
                    </LinearGradient>
                )}
                {!!badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.appLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HomeScreen() {
    const { unreadCounts, hasPendingBag, cpfs, batches, suspicion, pressure, tutStep, actions } =
        useGameStore(useShallow(s => ({
            unreadCounts: s.unreadCounts,
            hasPendingBag: s.hasPendingBag,
            cpfs: s.cpfs,
            batches: s.batches,
            suspicion: s.suspicion,
            pressure: s.pressure,
            tutStep: s.tutStep,
            actions: s.actions,
        })));

    const zepBadge = (hasPendingBag || Object.values(unreadCounts).some(n => n > 0)) ? 1 : 0;
    const bacenBadge = batches.some(b => b.days < 30) ? batches.filter(b => b.days < 30).length : 0;
    const laranjasBadge = cpfs > 0 ? 1 : 0;
    const dossieBadge = (suspicion > 70 || pressure > 70) ? 1 : 0;

    const isTutorial = tutStep < TUTORIAL.length;
    const highlightZep = tutStep === 2;
    const highlightLaranjas = tutStep === 6;
    const highlightBacen = tutStep === 9;
    const highlightCarteira = tutStep === 13;

    const go = (app: 'zep' | 'laranjas' | 'bacen' | 'carteira' | 'dossie') => {
        actions.setActiveApp(app);
    };

    return (
        <ImageBackground
            source={require('../mockups/bgnd_phone.png')}
            style={styles.bg}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.04)', 'rgba(0,0,0,0.72)']}
                locations={[0, 0.35, 1]}
                style={styles.overlay}
            >
                {/* Dynamic Island */}
                <View style={styles.island} />

                {/* Spacer — wallpaper fills the middle */}
                <View style={styles.spacer} />

                {/* App grid */}
                <View style={styles.grid}>
                    <AppIcon
                        label={UI_HOME.apps.zep}
                        image={ZEP_ICON}
                        badge={zepBadge}
                        onPress={() => go('zep')}
                        highlight={isTutorial && highlightZep}
                        dim={isTutorial && !highlightZep && tutStep !== 0 && tutStep !== 1}
                    />
                    <AppIcon
                        label={UI_HOME.apps.bacen}
                        gradient={['#fef08a', '#facc15']}
                        letter="B"
                        letterColor="#1d4ed8"
                        badge={bacenBadge}
                        onPress={() => go('bacen')}
                        highlight={isTutorial && highlightBacen}
                        dim={isTutorial && !highlightBacen && tutStep < 9}
                    />
                    <AppIcon
                        label={UI_HOME.apps.laranjas}
                        gradient={['#ff6a00', '#c94300']}
                        emoji="🍊"
                        badge={laranjasBadge}
                        onPress={() => go('laranjas')}
                        highlight={isTutorial && highlightLaranjas}
                        dim={isTutorial && !highlightLaranjas && tutStep < 6}
                    />
                    <AppIcon
                        label={UI_HOME.apps.calendario}
                        gradient={['#2563eb', '#1340a0']}
                        emoji="📅"
                        onPress={() => {}}
                        dim={true}
                    />
                    <AppIcon
                        label={UI_HOME.apps.carteira}
                        gradient={['#111111', '#0a0a0a']}
                        emoji="💰"
                        onPress={() => go('carteira')}
                        highlight={isTutorial && highlightCarteira}
                        dim={isTutorial && !highlightCarteira && tutStep < 13}
                    />
                    <AppIcon
                        label={UI_HOME.apps.dossie}
                        gradient={['#b91c1c', '#6b0f0f']}
                        emoji="📁"
                        badge={dossieBadge}
                        onPress={() => go('dossie')}
                    />
                    <AppIcon
                        label={UI_HOME.apps.news}
                        gradient={['#1d4ed8', '#0f2a80']}
                        emoji="📰"
                        onPress={() => {}}
                        dim={true}
                    />
                </View>

                {/* Home indicator */}
                <View style={styles.homeIndicator} />
            </LinearGradient>
        </ImageBackground>
    );
}

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        paddingHorizontal: 0,
    },
    island: {
        alignSelf: 'center',
        marginTop: 12,
        width: 120,
        height: 34,
        backgroundColor: '#050505',
        borderRadius: 20,
    },
    spacer: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        paddingBottom: 60,
        gap: 20,
        justifyContent: 'flex-start',
    },
    appItem: {
        width: 72,
        alignItems: 'center',
        gap: 7,
    },
    appDim: {
        opacity: 0.35,
    },
    iconWrapper: {
        width: 62,
        height: 62,
        borderRadius: 16,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    iconHighlight: {
        shadowColor: '#00ff41',
        shadowOpacity: 0.7,
        shadowRadius: 14,
        borderWidth: 2,
        borderColor: '#00ff41',
        borderRadius: 16,
    },
    iconGradient: {
        width: 62,
        height: 62,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    iconEmoji: {
        fontSize: 28,
    },
    iconLetter: {
        fontSize: 30,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ef2525',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(8,15,40,0.9)',
        zIndex: 2,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    appLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.88)',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    homeIndicator: {
        alignSelf: 'center',
        marginBottom: 10,
        width: 134,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
    },
});
