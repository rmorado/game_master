// components/IntroScreen.tsx
import { useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

const FADE_MS = 300;

const IMGS = [
    require('../assets/images/cutscenes/Intro01.png'),
    require('../assets/images/cutscenes/Intro02.png'),
    require('../assets/images/cutscenes/Intro03.png'),
    require('../assets/images/cutscenes/Intro04.png'),
];

function fade(val: Animated.Value, to: number) {
    return Animated.timing(val, { toValue: to, duration: FADE_MS, useNativeDriver: true });
}

interface Props {
    onComplete: () => void;
}

export function IntroScreen({ onComplete }: Props) {
    const [step, setStep] = useState(0);
    const isAnimating = useRef(false);

    // Top slot: img0 and img2 stacked
    const op0 = useRef(new Animated.Value(1)).current;
    const op2 = useRef(new Animated.Value(0)).current;
    // Bottom slot: img1 and img3 stacked
    const op1 = useRef(new Animated.Value(0)).current;
    const op3 = useRef(new Animated.Value(0)).current;

    const handleTap = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        if (step === 0) {
            fade(op1, 1).start(() => { isAnimating.current = false; setStep(1); });
        } else if (step === 1) {
            Animated.parallel([
                fade(op0, 0),
                fade(op2, 1),
                fade(op1, 0),
            ]).start(() => { isAnimating.current = false; setStep(2); });
        } else if (step === 2) {
            fade(op3, 1).start(() => { isAnimating.current = false; setStep(3); });
        } else if (step === 3) {
            isAnimating.current = false;
            onComplete();
        }
    };

    return (
        <TouchableWithoutFeedback onPress={handleTap}>
            <View style={styles.root}>
                {/* Top half */}
                <View style={styles.slot}>
                    <Animated.Image source={IMGS[0]} style={[styles.panel, { opacity: op0 }]} resizeMode="cover" />
                    <Animated.Image source={IMGS[2]} style={[styles.panel, { opacity: op2 }]} resizeMode="cover" />
                </View>
                {/* Bottom half */}
                <View style={styles.slot}>
                    <Animated.Image source={IMGS[1]} style={[styles.panel, { opacity: op1 }]} resizeMode="cover" />
                    <Animated.Image source={IMGS[3]} style={[styles.panel, { opacity: op3 }]} resizeMode="cover" />
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
    },
    slot: {
        flex: 1,
    },
    panel: {
        ...StyleSheet.absoluteFillObject,
    },
});
