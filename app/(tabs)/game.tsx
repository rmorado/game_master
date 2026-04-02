// app/(tabs)/game.tsx
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../hooks/use-game-store';
import { MS_PER_DAY } from '../../constants/game-data';
import { UI_GAME_OVER } from '../../constants/dialogues';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useRef } from 'react';
import { HomeScreen } from '../../components/HomeScreen';
import { ZepAppScreen } from '../../components/ZepAppScreen';
import { ChatScreen } from '../../components/ChatScreen';
import { LaranjaScreen } from '../../components/LaranjaScreen';
import { BacenScreen } from '../../components/BacenScreen';
import { CarteiraScreen } from '../../components/CarteiraScreen';
import { DossieScreen } from '../../components/DossieScreen';
import { PayModal } from '../../components/PayModal';
import { TutorialOverlay } from '../../components/TutorialOverlay';
import { NewMessagePopup } from '../../components/NewMessagePopup';
import { LevelUpScreen } from '../../components/LevelUpScreen';
import { BottomNavBar } from '../../components/BottomNavBar';
import { AppOverview } from '../../components/AppOverview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GameScreen() {
    const insets = useSafeAreaInsets();
    const { actions, activeApp, isGameOver, gameOverReason, gameOverDetail, levelIdx, day, omstreDayStart, levelUpScreen, activeToast } = useGameStore(useShallow(state => ({
        actions: state.actions,
        activeApp: state.activeApp,
        isGameOver: state.isGameOver,
        gameOverReason: state.gameOverReason,
        gameOverDetail: state.gameOverDetail,
        levelIdx: state.levelIdx,
        day: state.day,
        omstreDayStart: state.omstreDayStart,
        levelUpScreen: state.levelUpScreen,
        activeToast: state.activeToast,
    })));

    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const gameLoop = setInterval(() => {
            actions.tick();
        }, MS_PER_DAY);

        return () => clearInterval(gameLoop);
    }, [actions]);

    useEffect(() => {
        if (!activeToast) return;
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => actions.clearToast(), 3000);
    }, [activeToast?.id]);

    if (isGameOver) {
        const masterDays = levelIdx === 3 && omstreDayStart > 0
            ? day - omstreDayStart
            : null;

        return (
            <View style={styles.gameOver}>
                <Text style={styles.gameOverReason}>{gameOverReason}</Text>
                <Text style={styles.gameOverDetail}>{gameOverDetail}</Text>
                {masterDays !== null && (
                    <Text style={styles.gameOverScore}>{UI_GAME_OVER.masterDays(masterDays)}</Text>
                )}
                <TouchableOpacity
                    style={styles.restartBtn}
                    onPress={() => actions.restartGame()}
                >
                    <Text style={styles.restartBtnText}>{UI_GAME_OVER.restartBtn}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (levelUpScreen !== null) {
        return <LevelUpScreen />;
    }

    const renderApp = () => {
        switch (activeApp) {
            case 'zep':     return <ZepAppScreen />;
            case 'chat':    return <ChatScreen />;
            case 'laranjas': return <LaranjaScreen />;
            case 'bacen':   return <BacenScreen />;
            case 'carteira': return <CarteiraScreen />;
            case 'dossie':  return <DossieScreen />;
            default:        return <HomeScreen />;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <View style={[styles.appArea, { paddingTop: insets.top }]}>
                {renderApp()}
            </View>
            <BottomNavBar />
            {activeToast && (
                <TouchableOpacity
                    style={[styles.toast, activeToast.appId === 'bacen' ? styles.toastBacen : styles.toastLaranjas]}
                    onPress={() => actions.clearToast()}
                    activeOpacity={0.9}
                >
                    {activeToast.appId === 'laranjas' ? (
                        <LinearGradient colors={['#ff6a00', '#c94300']} style={styles.toastIcon}>
                            <Text style={styles.toastIconEmoji}>🍊</Text>
                        </LinearGradient>
                    ) : (
                        <View style={[styles.toastIcon, styles.toastIconBacen]}>
                            <Text style={styles.toastIconLetter}>B</Text>
                        </View>
                    )}
                    <View style={styles.toastText}>
                        <Text style={[styles.toastAppName, activeToast.appId === 'bacen' ? styles.toastAccentBacen : styles.toastAccentLaranjas]}>
                            {activeToast.appId === 'laranjas' ? 'Laranjas' : 'BACEN'}
                        </Text>
                        <Text style={styles.toastMessage}>{activeToast.message}</Text>
                    </View>
                </TouchableOpacity>
            )}
            <AppOverview />
            <PayModal />
            <TutorialOverlay />
            <NewMessagePopup />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
    },
    appArea: {
        flex: 1,
    },
    toast: {
        position: 'absolute',
        top: 54,
        left: 12,
        right: 12,
        zIndex: 10000,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
    },
    toastLaranjas: {
        backgroundColor: 'rgba(30,12,0,0.92)',
    },
    toastBacen: {
        backgroundColor: 'rgba(10,16,40,0.92)',
    },
    toastIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toastIconBacen: {
        backgroundColor: '#f59e0b',
    },
    toastIconEmoji: {
        fontSize: 17,
    },
    toastIconLetter: {
        fontSize: 17,
        fontWeight: '900',
        color: '#1d4ed8',
    },
    toastText: {
        flex: 1,
    },
    toastAppName: {
        fontSize: 12,
        fontWeight: '700',
        fontFamily: Platform.select({ ios: 'SFProText-Semibold', android: 'sans-serif-medium' }),
    },
    toastAccentLaranjas: {
        color: '#f97316',
    },
    toastAccentBacen: {
        color: '#60a5fa',
    },
    toastMessage: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 1,
        fontFamily: Platform.select({ ios: 'SFProText-Regular', android: 'sans-serif' }),
    },
    gameOver: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f0f0f',
        padding: 30,
        gap: 20,
    },
    gameOverReason: {
        color: '#ff3b30',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 2,
    },
    gameOverDetail: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
    },
    gameOverScore: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    restartBtn: {
        marginTop: 20,
        paddingVertical: 14,
        paddingHorizontal: 40,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#D4AF37',
        borderRadius: 8,
    },
    restartBtnText: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
});
