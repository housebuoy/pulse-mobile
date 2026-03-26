import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function SettingsCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10, 
    overflow: 'hidden',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.03,
    // shadowRadius: 8,
    // elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  }
});