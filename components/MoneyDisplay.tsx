// components/MoneyDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MoneyDisplayProps {
  dirty: number;
  cpfs: number;
  clean: number;
}

const formatMoney = (n: number) => {
    if(n >= 1000000) return (n/1000000).toFixed(1) + "M";
    if(n >= 1000) return (n/1000).toFixed(0) + "k";
    return Math.floor(n);
}

export function MoneyDisplay({ dirty, cpfs, clean }: MoneyDisplayProps) {
  return (
    <View style={styles.moneyDisplay}>
      <View style={styles.moneyCol}>
        <Text style={styles.mLabel}>Sujo</Text>
        <Text style={[styles.mVal, styles.valGold]}>{formatMoney(dirty)}</Text>
      </View>
      <View style={styles.moneyCol}>
        <Text style={styles.mLabel}>Identidades</Text>
        <Text style={styles.mVal}>{cpfs}</Text>
      </View>
      <View style={styles.moneyCol}>
        <Text style={styles.mLabel}>Limpo</Text>
        <Text style={[styles.mVal, styles.valGreen]}>{formatMoney(clean)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  moneyDisplay: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    width: '100%',
  },
  moneyCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '33%',
  },
  mLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  mVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  valGold: {
    color: '#D4AF37',
  },
  valGreen: {
    color: '#00ff41',
  },
});
