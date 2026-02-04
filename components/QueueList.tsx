// components/QueueList.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Batch } from '../types/game';

interface QueueListProps {
  batches: Batch[];
}

const formatMoney = (n: number) => {
    if(n >= 1000000) return (n/1000000).toFixed(1) + "M";
    if(n >= 1000) return (n/1000).toFixed(0) + "k";
    return Math.floor(n);
}

export function QueueList({ batches }: QueueListProps) {
  return (
    <View style={styles.queueContainer}>
      <View style={styles.queueHeader}>
        <Text style={styles.headerText}>Contratos Pendentes (Devolver 70%)</Text>
      </View>
      <FlatList
        data={batches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.queueItem, item.days < 30 ? styles.critical : null]}>
            <View>
              <Text style={styles.dueLabel}>À Rendre</Text>
              <Text style={styles.dueValue}>{formatMoney(item.due)}</Text>
            </View>
            <View style={styles.qTimer}>
              <Text style={styles.timerText}>{item.days} dias</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma Dívida</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  queueContainer: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  queueHeader: {
    backgroundColor: '#222',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  headerText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#aaa',
    textTransform: 'uppercase',
  },
  queueItem: {
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderColor: '#222',
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  critical: {
    borderLeftWidth: 3,
    borderColor: '#ff3333',
    backgroundColor: 'rgba(255, 50, 50, 0.1)',
  },
  dueLabel: {
    color: '#aaa',
  },
  dueValue: {
    fontWeight: 'bold',
    color: '#4da6ff',
  },
  qTimer: {
    backgroundColor: '#333',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  timerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#444',
    padding: 10,
  },
});
