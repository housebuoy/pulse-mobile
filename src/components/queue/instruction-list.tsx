import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme'; 

interface Rule {
  id: string;
  text: React.ReactNode;
}

interface InstructionListProps {
  rules: Rule[];
}

export default function InstructionList({ rules }: InstructionListProps) {
  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Important Information</Text>
      </View>

      {/* The List */}
      <View style={styles.listContainer}>
        {rules.map((rule, index) => (
          <View key={rule.id} style={styles.listItem}>
            {/* The little blue numbered circle */}
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            
            {/* The rule text */}
            <Text style={styles.itemText}>{rule.text}</Text>
          </View>
        ))}
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    // borderRadius: 24,
    padding: 24,
    // Adds a very subtle shadow to lift it off the off-white background
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2, 
    marginBottom: 40,
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
  listContainer: {
    gap: 20, // Spaces out each rule perfectly
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF', // Very light blue
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2, // Aligns the circle with the first line of text
  },
  numberText: {
    color: COLORS.primary, // Your brand blue
    fontWeight: '800',
    fontSize: 14,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  }
});