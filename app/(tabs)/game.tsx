// app/(tabs)/game.tsx
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../hooks/use-game-store';
import { useEffect } from 'react';
import { BankScreen } from '../../components/BankScreen';
import { ZepScreen } from '../../components/ZepScreen';
import { ChatScreen } from '../../components/ChatScreen';
import { NavBar } from '../../components/NavBar';
import { LoanModal } from '../../components/LoanModal';
import { PayModal } from '../../components/PayModal';

export default function GameScreen() {
    const { actions, activeScreen } = useGameStore(state => ({
        actions: state.actions,
        activeScreen: state.activeScreen,
    }));

    useEffect(() => {
        const gameLoop = setInterval(() => {
            actions.tick();
        }, 1000);

        return () => clearInterval(gameLoop);
    }, [actions]);

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
            {activeScreen !== 'chat' && <NavBar />}
            <LoanModal />
            <PayModal />
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
});
