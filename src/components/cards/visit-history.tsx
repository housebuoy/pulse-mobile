import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VisitHistoryCardProps {
  date: string;
  title: string;
  doctorName: string;
  room: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  onPress?: () => void;
}

export default function VisitHistoryCard({
  date,
  title,
  doctorName,
  room,
  iconName,
  iconColor = '#2563EB',
  iconBgColor = '#EFF6FF',
  onPress
}: VisitHistoryCardProps) {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.7}>
      
      {/* Top Row: Icon & Date */}
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </View>

      {/* Bottom Row: Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitleText} numberOfLines={1}>
          {doctorName} • {room}
        </Text>
      </View>
      
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    width: 220, // Fixed width for horizontal scrolling on Home
    marginRight: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  detailsContainer: {
    gap: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
});