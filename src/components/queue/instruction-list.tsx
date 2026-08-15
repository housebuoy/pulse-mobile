import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Rule {
  id: string;
  text: React.ReactNode;
}

interface InstructionListProps {
  // 1. ADD DEFAULT FALLBACK HERE
  rules?: Rule[];
}

// 2. DEFAULT PROPS TO EMPTY ARRAY
export default function InstructionList({ rules = [] }: InstructionListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Important Information</Text>
      </View>
      <View>
      <View style={styles.dashedLine} />

      {/* 3. ADD THE QUESTION MARK BEFORE .map */}
      {rules?.map((rule, index) => (
        <View key={rule.id} style={styles.stepRow}>
          <View style={styles.numberBubble}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>

          <View style={styles.textContainer}>{rule.text}</View>
        </View>
        
      ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingVertical: 10,
  },
  dashedLine: {
    position: 'absolute',
    left: 15,
    top: 20,
    bottom: 40,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    zIndex: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    zIndex: 1,
  },
  numberBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 4,
    borderColor: '#fff',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  textContainer: {
    flex: 1,
    paddingTop: 4,
  },
});
