import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface CategoryPillsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryPills({ categories, activeCategory, onSelect }: CategoryPillsProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.scrollContainer}
    >
      {categories.map((category) => {
        const isActive = category === activeCategory;
        return (
          <TouchableOpacity 
            key={category}
            onPress={() => onSelect(category)}
            style={[styles.pill, isActive ? styles.activePill : styles.inactivePill]}
          >
            <Text style={[styles.text, isActive ? styles.activeText : styles.inactiveText]}>
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 12,
  },
  activePill: {
    backgroundColor: COLORS.primary,
  },
  inactivePill: {
    backgroundColor: '#F3F4F6',
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#4B5563',
  }
});