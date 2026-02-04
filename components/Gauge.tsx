// components/Gauge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GaugeProps {
  label: string;
  value: number;
  color: string;
}

export function Gauge({ label, value, color }: GaugeProps) {
  return (
    <View style={styles.gaugeWrap}>
      <View style={styles.gaugeInfo}>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.valueText}>{Math.floor(value)}%</Text>
      </View>
      <View style={styles.gaugeBar}>
        <View style={[styles.gaugeFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gaugeWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '100%',
  },
  gaugeInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#888',
  },
  gaugeBar: {
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
  },
  labelText: {
    color: '#888',
    fontSize: 11,
    fontWeight: 'bold',
  },
  valueText: {
    color: '#888',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
