import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useInsuranceStore } from '@/stores/insurance-store';

// The photo is a convenience backup only — the structured fields in
// InsuranceDetailsCard are the record of truth. Nothing here is read back
// or parsed; it's just a picture the patient chose to keep alongside it.
export default function InsurancePhotoCard() {
  const cardPhotoUri = useInsuranceStore((state) => state.cardPhotoUri);
  const setCardPhotoUri = useInsuranceStore((state) => state.setCardPhotoUri);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo library access to attach a picture of your insurance card.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setCardPhotoUri(uri);
      void import('@/lib/api/patient').then(async ({ uploadImage, putInsurance, getInsurance }) => {
        const uploaded = await uploadImage(uri);
        const current = await getInsurance();
        await putInsurance({ ...current, cardPhotoUri: uploaded.url });
        setCardPhotoUri(uploaded.url);
      });
    }
  };

  const removePhoto = () => setCardPhotoUri(null);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="camera-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.title}>CARD PHOTO</Text>
        </View>
        <Text style={styles.optionalTag}>Optional</Text>
      </View>

      {cardPhotoUri ? (
        <View style={styles.photoRow}>
          <Image source={{ uri: cardPhotoUri }} style={styles.photoThumb} />
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoActionBtn} onPress={pickPhoto} activeOpacity={0.7}>
              <Text style={styles.photoActionText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoActionBtn} onPress={removePhoto} activeOpacity={0.7}>
              <Text style={[styles.photoActionText, { color: COLORS.danger }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadSlot} onPress={pickPhoto} activeOpacity={0.7}>
          <Ionicons name="cloud-upload-outline" size={22} color="#9CA3AF" />
          <Text style={styles.uploadText}>Add a photo of your card — optional</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#111827' },
  optionalTag: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },

  uploadSlot: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
  },
  uploadText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', textAlign: 'center' },

  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  photoThumb: {
    width: 88,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  photoActions: { flexDirection: 'row', gap: 16 },
  photoActionBtn: { padding: 4 },
  photoActionText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});
