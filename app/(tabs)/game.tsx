// app/(tabs)/game.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../../hooks/use-game-store';
import { useEffect } from 'react';
import { BankScreen } from '../../components/BankScreen';
import { ZepScreen } from '../../components/ZepScreen';
import { ChatScreen } from '../../components/ChatScreen';
import { NavBar } from '../../components/NavBar';
import { LoanModalCinematic } from '../../components/LoanModalCinematic';
import { PayModal } from '../../components/PayModal';
import { SellDebtModal } from '../../components/SellDebtModal';
import { TutorialOverlay } from '../../components/TutorialOverlay';
import { NewMessagePopup } from '../../components/NewMessagePopup';

export default function GameScreen() {
    const { actions, activeScreen, isGameOver, gameOverReason, gameOverDetail, levelIdx, day, omstreDayStart } = useGameStore(state => ({
        actions: state.actions,
        activeScreen: state.activeScreen,
        isGameOver: state.isGameOver,
        gameOverReason: state.gameOverReason,
        gameOverDetail: state.gameOverDetail,
        levelIdx: state.levelIdx,
        day: state.day,
        omstreDayStart: state.omstreDayStart,
    }));

    useEffect(() => {
        const gameLoop = setInterval(() => {
            actions.tick();
        }, 1000);

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

    const renderScreen = () => {
        if (activeScreen === 'chat') {
            return <ChatScreen />;
        }
        if (activeScreen === 'zep') {
            return <ZepScreen />;
        }
        return <BankScreen />;
    }

    return (
        <View style={styles.container}>
            {renderScreen()}
            <NavBar />
            <LoanModalCinematic />
            <PayModal />
            <SellDebtModal />
            <TutorialOverlay />
            <NewMessagePopup />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
        paddingTop: 40,
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
