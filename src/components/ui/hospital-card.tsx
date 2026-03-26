import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
interface HospitalCardProps {
  name: string;
  location: string;
  distance: string;
  waitStatus: 'Low Wait' | 'Moderate Wait' | 'High Wait';
  nextSlot: string;
  rating: string;
  imageUrl: string;
  onPress: () => void;
}

export default function HospitalCard({
  name, location, distance, waitStatus, nextSlot, rating, imageUrl, onPress
}: HospitalCardProps) {
  
  // Determine badge colors based on wait status
  const getBadgeStyle = () => {
    switch (waitStatus) {
      case 'Low Wait': return { bg: '#DCFCE7', text: '#16A34A' };
      case 'Moderate Wait': return { bg: '#FEF9C3', text: '#CA8A04' };
      case 'High Wait': return { bg: '#FEE2E2', text: '#DC2626' };
    }
  };
  const badgeColors = getBadgeStyle();

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Image & Distance Pill */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.distanceBadge}>
          <Ionicons name="navigate" size={12} color={COLORS.primary} />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
          <View style={[styles.waitBadge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.waitText, { color: badgeColors.text }]}>{waitStatus}</Text>
          </View>
        </View>
        
        <Text style={styles.locationText}>{location}</Text>

        <View style={styles.footerRow}>
          <View style={styles.footerItem}>
            <Ionicons name="time" size={16} color={COLORS.primary} />
            <Text style={styles.footerText}>Next slot: {nextSlot}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="star" size={16} color="#EAB308" />
            <Text style={styles.footerText}>{rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  detailsContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  waitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  waitText: {
    fontSize: 10,
    fontWeight: '700',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  }
});