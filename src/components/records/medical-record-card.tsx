import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface MedicalRecordCardProps {
  department: string;
  hospital: string;
  date: string;
  doctor: string;
  summary: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  onPress: () => void;
}

export default function MedicalRecordCard({
  department, hospital, date, doctor, summary, iconName, iconBgColor, iconColor, onPress
}: MedicalRecordCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        
        {/* Dynamic Icon */}
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        {/* Text Content */}
        <View style={styles.rightContent}>
          
          <View style={styles.headerRow}>
            <Text style={styles.departmentName} numberOfLines={1}>{department}</Text>
            <View style={styles.datePill}>
              <Text style={styles.dateText}>{date}</Text>
            </View>
          </View>
          
          <Text style={styles.hospitalName} numberOfLines={1}>{hospital}</Text>

          <View style={styles.doctorRow}>
            <Ionicons name="person-outline" size={14} color="#4B5563" />
            <Text style={styles.doctorName}>{doctor}</Text>
          </View>

          <Text style={styles.summaryText} numberOfLines={2}>
            {summary}
          </Text>

          <TouchableOpacity style={styles.actionRow} onPress={onPress}>
            <Text style={styles.actionText}>View Full Summary</Text>
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
    borderRadius: 20, // As explicitly requested!
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
  departmentName: {
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
  summaryText: {
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
  }
});