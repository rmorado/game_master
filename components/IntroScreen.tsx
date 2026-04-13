// components/IntroScreen.tsx
import { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

const { width, height } = Dimensions.get('screen');
const HALF = height / 2;
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

// Layout: top slot holds panels 0 and 2 stacked; bottom slot holds panels 1 and 3 stacked.
// Steps:
//   0 → tap → bottom panel 1 fades in
//   1 → tap → top swaps 0→2, bottom fades out (panel 1 gone, panel 3 not yet)
//   2 → tap → bottom panel 3 fades in
//   3 → tap → onComplete
export function IntroScreen({ onComplete }: Props) {
    const [step, setStep] = useState(0);
    const isAnimating = useRef(false);

    const op0 = useRef(new Animated.Value(1)).current;  // top: panel 0 (starts visible)
    const op2 = useRef(new Animated.Value(0)).current;  // top: panel 2
    const op1 = useRef(new Animated.Value(0)).current;  // bottom: panel 1
    const op3 = useRef(new Animated.Value(0)).current;  // bottom: panel 3

    const handleTap = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        if (step === 0) {
            fade(op1, 1).start(() => { isAnimating.current = false; setStep(1); });
        } else if (step === 1) {
            Animated.parallel([fade(op0, 0), fade(op2, 1), fade(op1, 0)])
                .start(() => { isAnimating.current = false; setStep(2); });
        } else if (step === 2) {
            fade(op3, 1).start(() => { isAnimating.current = false; setStep(3); });
        } else {
            isAnimating.current = false;
            onComplete();
        }
    };

    return (
        <TouchableWithoutFeedback onPress={handleTap}>
            <View style={styles.root}>
                <View style={styles.slot}>
                    <Animated.Image source={IMGS[0]} style={[styles.panel, { opacity: op0 }]} resizeMode="cover" />
                    <Animated.Image source={IMGS[2]} style={[styles.panel, { opacity: op2 }]} resizeMode="cover" />
                </View>
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
        width,
        height,
        backgroundColor: '#000',
    },
    slot: {
        width,
        height: HALF,
    },
    panel: {
        position: 'absolute',
        width,
        height: HALF,
    },
});
