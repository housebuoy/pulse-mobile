import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CategoryPillsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

// Same segmented-track look as the Records tabs — one neutral gray track,
// the active item lifted on white. No per-item color.
export default function CategoryPills({
  categories,
  activeCategory,
  onSelect,
}: CategoryPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.track}
      contentContainerStyle={styles.trackContent}>
      {categories.map((category) => {
        const isActive = category === activeCategory;
        return (
          <TouchableOpacity
            key={category}
            onPress={() => onSelect(category)}
            style={[styles.pill, isActive && styles.activePill]}
            activeOpacity={0.8}>
            <Text style={[styles.text, isActive && styles.activeText]}>{category}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 24,
  },
  trackContent: {
    padding: 4,
    gap: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activePill: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
    color: '#6B7280',
  },
  activeText: {
    color: '#111827',
  },
});
