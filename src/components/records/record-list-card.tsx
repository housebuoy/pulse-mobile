import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { IconFamily } from '@/constants/medical-category';

export interface RecordCardIcon {
  family: IconFamily;
  name: string;
  bgColor: string;
  color: string;
}

interface RecordListCardProps {
  icon: RecordCardIcon;
  title: string;
  dateLabel: string;
  hospital: string;
  doctorLabel: string;
  previewText: string;
  actionLabel: string;
  onPress: () => void;
}

// Shared visual shell for every Records tab (Visits, Lab Results,
// Prescriptions) so the three read as one consistent list style.
export default function RecordListCard({
  icon,
  title,
  dateLabel,
  hospital,
  doctorLabel,
  previewText,
  actionLabel,
  onPress,
}: RecordListCardProps) {
  const renderIcon = () => {
    switch (icon.family) {
      case 'FontAwesome5':
        return <FontAwesome5 name={icon.name as any} size={22} color={icon.color} />;
      case 'FontAwesome6':
        return <FontAwesome6 name={icon.name as any} size={24} color={icon.color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={icon.name as any} size={24} color={icon.color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={icon.name as any} size={24} color={icon.color} />;
      case 'Ionicons':
      default:
        return <Ionicons name={icon.name as any} size={24} color={icon.color} />;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: icon.bgColor }]}>{renderIcon()}</View>

        <View style={styles.rightContent}>
          <View style={styles.headerRow}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.datePill}>
              <Text style={styles.dateText}>{dateLabel}</Text>
            </View>
          </View>

          <Text style={styles.hospitalName} numberOfLines={1}>
            {hospital}
          </Text>

          <View style={styles.doctorRow}>
            <Ionicons name="person-outline" size={14} color="#4B5563" />
            <Text style={styles.doctorName}>{doctorLabel}</Text>
          </View>

          <Text style={styles.previewText} numberOfLines={2}>
            {previewText}
          </Text>

          <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.actionText}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rightContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  datePill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  hospitalName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  previewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 2,
  },
});
