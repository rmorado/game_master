// app/(tabs)/game.tsx
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useGameStore } from '../../hooks/use-game-store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect } from 'react';
import { HomeScreen } from '../../components/HomeScreen';
import { ZepAppScreen } from '../../components/ZepAppScreen';
import { ChatScreen } from '../../components/ChatScreen';
import { LaranjaScreen } from '../../components/LaranjaScreen';
import { BacenScreen } from '../../components/BacenScreen';
import { CarteiraScreen } from '../../components/CarteiraScreen';
import { PayModal } from '../../components/PayModal';
import { TutorialOverlay } from '../../components/TutorialOverlay';
import { NewMessagePopup } from '../../components/NewMessagePopup';
import { LevelUpScreen } from '../../components/LevelUpScreen';
import { BottomNavBar } from '../../components/BottomNavBar';
import { AppOverview } from '../../components/AppOverview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GameScreen() {
    const insets = useSafeAreaInsets();
    const { actions, activeApp, isGameOver, gameOverReason, gameOverDetail, levelIdx, day, omstreDayStart, levelUpScreen } = useGameStore(useShallow(state => ({
        actions: state.actions,
        activeApp: state.activeApp,
        isGameOver: state.isGameOver,
        gameOverReason: state.gameOverReason,
        gameOverDetail: state.gameOverDetail,
        levelIdx: state.levelIdx,
        day: state.day,
        omstreDayStart: state.omstreDayStart,
        levelUpScreen: state.levelUpScreen,
    })));

    useEffect(() => {
        const gameLoop = setInterval(() => {
            actions.tick();
        }, 10000);

        return () => clearInterval(gameLoop);
    }, [actions]);

    if (isGameOver) {
        const masterDays = levelIdx === 3 && omstreDayStart > 0
            ? day - omstreDayStart
            : null;

        return (
            <View style={styles.gameOver}>
                <Text style={styles.gameOverReason}>{gameOverReason}</Text>
                <Text style={styles.gameOverDetail}>{gameOverDetail}</Text>
                {masterDays !== null && (
                    <Text style={styles.gameOverScore}>
                        Dias como O Mestre: {masterDays}
                    </Text>
                )}
                <TouchableOpacity
                    style={styles.restartBtn}
                    onPress={() => actions.restartGame()}
                >
                    <Text style={styles.restartBtnText}>NOVA PARTIDA</Text>
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
