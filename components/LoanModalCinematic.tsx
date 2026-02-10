// components/LoanModalCinematic.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useGameStore } from '../hooks/use-game-store';
import { LEVELS } from '../constants/game-data';
import { UI_LOAN_CINEMATIC } from '../constants/dialogues';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateFakeCPF = () => {
  const part1 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const part2 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const part3 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const part4 = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${part1}.${part2}.${part3}-${part4}`;
};

const formatMoney = (value: number) => {
  return Math.floor(value).toLocaleString('pt-BR');
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Matrix Background Component
const MatrixBackground = () => {
  const columns = 6;
  const columnAnims = useRef(
    Array.from({ length: columns }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = columnAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(anim, {
            toValue: 1,
            duration: 8000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.matrixContainer}>
      {columnAnims.map((anim, i) => {
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-SCREEN_HEIGHT, SCREEN_HEIGHT],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.matrixColumn,
              {
                left: `${(i / columns) * 100}%`,
                transform: [{ translateY }],
              },
            ]}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <Text key={j} style={styles.matrixText}>
                {generateFakeCPF().substring(0, 11)}
              </Text>
            ))}
          </Animated.View>
        );
      })}
    </View>
  );
};

// Animated Title Component
const AnimatedTitle = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
      <Text style={styles.titleText}>{UI_LOAN_CINEMATIC.processingTitle}</Text>
    </Animated.View>
  );
};

// Fake Progress Bar Component
const FakeProgressBar = () => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 100,
          duration: 2500,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width }]} />
      </View>
      <Text style={styles.progressLabel}>{UI_LOAN_CINEMATIC.processingLabel}</Text>
    </View>
  );
};

// Values Display Component (No animation for instant updates)
interface ValuesDisplayProps {
  cpfCount: number;
  dirtyCost: number;
  cleanGain: number;
  suspicionRate: number;
}

const ValuesDisplay = ({ cpfCount, dirtyCost, cleanGain, suspicionRate }: ValuesDisplayProps) => {
  return (
    <View style={styles.valuesContainer}>
      <Text style={styles.valuesTitle}>{UI_LOAN_CINEMATIC.sectionValues}</Text>
      <View style={styles.valuesBox}>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>{UI_LOAN_CINEMATIC.labelCpfs}</Text>
          <Text style={styles.valueNumber}>{cpfCount}</Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>{UI_LOAN_CINEMATIC.labelDirty}</Text>
          <Text style={[styles.valueNumber, { color: '#D4AF37' }]}>
            R$ {formatMoney(dirtyCost)}
          </Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>{UI_LOAN_CINEMATIC.labelClean}</Text>
          <Text style={[styles.valueNumber, { color: '#00ff41' }]}>
            R$ {formatMoney(cleanGain)}
          </Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>{UI_LOAN_CINEMATIC.labelSuspicion}</Text>
          <Text style={[styles.valueNumber, { color: '#ff3b30' }]}>
            +{suspicionRate.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

// CPF Preview List Component
interface CPFPreviewListProps {
  count: number;
}

const CPFPreviewList = ({ count }: CPFPreviewListProps) => {
  const cpfs = useMemo(
    () => Array.from({ length: count }, () => generateFakeCPF()),
    [count]
  );

  return (
    <View style={styles.cpfListContainer}>
      <Text style={styles.cpfListTitle}>{UI_LOAN_CINEMATIC.sectionCpfs}</Text>
      <ScrollView style={styles.cpfScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.cpfGrid}>
          {cpfs.map((cpf, i) => (
            <Text key={i} style={styles.cpfItem}>
              {cpf}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Confirm Button Component with Press Animation
interface ConfirmButtonProps {
  onPress: () => void;
  disabled: boolean;
}

const ConfirmButton = ({ onPress, disabled }: ConfirmButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={styles.confirmButtonContainer}
    >
      <Animated.View
        style={[
          styles.confirmButton,
          disabled && styles.confirmButtonDisabled,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.confirmButtonText}>{UI_LOAN_CINEMATIC.btnConfirm}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LoanModalCinematic() {
  const { modal, dirty, cpfs, levelIdx, tutStep, actions } = useGameStore(state => state);
  const [sliderValue, setSliderValue] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentLevel = LEVELS[levelIdx];
  const maxCPFs = Math.min(cpfs, 100);

  // Derived calculations
  const dirtyCost = sliderValue * 5000;
  const cleanGain = sliderValue * 5000;
  const suspicionIncrease = sliderValue * currentLevel.suspRate;

  // Validation
  const canConfirm = cpfs >= sliderValue && dirty >= dirtyCost;

  const handleClose = () => {
    setIsProcessing(false);
    setIsComplete(false);
    actions.setModal('none');
  };

  const handleConfirm = () => {
    if (canConfirm && !isProcessing) {
      setIsProcessing(true);

      // Wait for animations to complete before executing loan
      setTimeout(() => {
        actions.confirmLoan(sliderValue);
        setIsProcessing(false);
        setIsComplete(true);

        // Auto-close after showing success message
        setTimeout(() => {
          handleClose();
        }, 2000);
      }, 2500);
    }
  };

  const visible = modal === 'loan';

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setIsProcessing(false);
      setIsComplete(false);
    }
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        {/* Only show matrix background during processing */}
        {isProcessing && <MatrixBackground />}

        <View style={styles.contentContainer}>
          {/* Show different content based on state */}
          {isComplete ? (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>{UI_LOAN_CINEMATIC.successTitle}</Text>
              <Text style={styles.successSubtitle}>{UI_LOAN_CINEMATIC.successSubtitle}</Text>
            </View>
          ) : isProcessing ? (
            <>
              <AnimatedTitle />
              <FakeProgressBar />
              <ValuesDisplay
                cpfCount={sliderValue}
                dirtyCost={dirtyCost}
                cleanGain={cleanGain}
                suspicionRate={suspicionIncrease}
              />
            </>
          ) : (
            <>
              <View style={styles.staticTitleContainer}>
                <Text style={styles.staticTitle}>{UI_LOAN_CINEMATIC.title}</Text>
                <Text style={styles.staticSubtitle}>{UI_LOAN_CINEMATIC.subtitle}</Text>
              </View>

              <ValuesDisplay
                cpfCount={sliderValue}
                dirtyCost={dirtyCost}
                cleanGain={cleanGain}
                suspicionRate={suspicionIncrease}
              />

              <View style={styles.sliderContainer}>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  minimumValue={10}
                  maximumValue={maxCPFs}
                  step={1}
                  minimumTrackTintColor="#00ff41"
                  maximumTrackTintColor="#333"
                  thumbTintColor="#D4AF37"
                  style={styles.slider}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>10</Text>
                  <Text style={styles.sliderLabel}>{maxCPFs}</Text>
                </View>
              </View>

              <CPFPreviewList count={sliderValue} />

              <ConfirmButton onPress={handleConfirm} disabled={!canConfirm} />

              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.cancelLink}>{UI_LOAN_CINEMATIC.btnCancel}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  matrixColumn: {
    position: 'absolute',
    width: '16.66%',
  },
  matrixText: {
    color: '#00ff41',
    opacity: 0.3,
    fontSize: 10,
    fontFamily: 'Courier',
    marginVertical: 4,
  },
  contentContainer: {
    width: '90%',
    maxWidth: 400,
    paddingVertical: 30,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  titleContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  titleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textShadowColor: '#00ff41',
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  staticTitleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  staticTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  staticSubtitle: {
    color: '#aaa',
    fontSize: 13,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  successTitle: {
    color: '#00ff41',
    fontSize: 22,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff41',
  },
  progressLabel: {
    color: '#00ff41',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
  valuesContainer: {
    marginBottom: 20,
  },
  valuesTitle: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  valuesBox: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    padding: 15,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  valueLabel: {
    color: '#aaa',
    fontSize: 13,
  },
  valueNumber: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Courier',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'Courier',
  },
  cpfListContainer: {
    marginBottom: 20,
  },
  cpfListTitle: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  cpfScrollView: {
    maxHeight: 120,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
  },
  cpfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cpfItem: {
    color: '#00ff41',
    fontSize: 10,
    fontFamily: 'Courier',
    opacity: 0.7,
    width: '48%',
  },
  confirmButtonContainer: {
    marginBottom: 15,
  },
  confirmButton: {
    backgroundColor: '#D4AF37',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.3,
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cancelLink: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
});
