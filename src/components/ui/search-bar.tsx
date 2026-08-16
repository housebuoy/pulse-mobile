import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  filterActive?: boolean;
}

export default function SearchBar({
  placeholder = "Search hospitals...",
  value,
  onChangeText,
  onFilterPress,
  filterActive,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color="#3B82F6" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      <TouchableOpacity
        style={[styles.filterButton, filterActive && styles.filterButtonActive]}
        onPress={onFilterPress}>
        <Ionicons name="options-outline" size={20} color={filterActive ? '#2563EB' : '#111827'} />
        {filterActive && <View style={styles.filterDot} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 5,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    borderWidth: 1.5,
    borderColor: '#EFF6FF',
  },
});