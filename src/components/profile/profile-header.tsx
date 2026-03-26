import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

export default function ProfileHeader() {
  return (
    <View style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarWrapper}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&auto=format&fit=crop' }} 
          style={styles.avatar} 
        />
        <View style={styles.activeDot} />
        <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
          <Ionicons name="pencil" size={12} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.userName}>Kelvin Quarcoo</Text>
        <Text style={styles.contactText}>kelvin@email.com</Text>
        <Text style={styles.contactText}>+233 55 123 4567</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10, // Eased from the pill-shape
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: '#10B981',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    backgroundColor: '#9CA3AF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  }
});