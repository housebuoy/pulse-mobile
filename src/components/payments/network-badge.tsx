import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentNetwork } from '@/stores/payments-store';

// A neutral housing (no per-item colored squares) with a small brand-colored
// mark inside — MTN's yellow and Telecel's red are the only color carried
// here, and only on the mark itself, not the badge background. These are
// stylized monograms standing in for the real MTN MoMo / Telecel Cash brand
// marks — swap in the official lockups from each brand kit when available by
// replacing the inner <View>/<Text> with an <Image>.
export default function NetworkBadge({
  network,
  size = 32,
}: {
  network: PaymentNetwork;
  size?: number;
}) {
  const markSize = Math.round(size * 0.62);

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size * 0.3 }]}>
      {network === 'card' ? (
        <Ionicons name="card-outline" size={Math.round(size * 0.5)} color="#4B5563" />
      ) : (
        <View
          style={[
            styles.mark,
            {
              width: markSize,
              height: markSize,
              borderRadius: markSize / 2,
              backgroundColor: network === 'mtn_momo' ? '#FFCC00' : '#E30613',
            },
          ]}>
          <Text
            style={[
              styles.markText,
              {
                fontSize: Math.round(size * 0.26),
                color: network === 'mtn_momo' ? '#111827' : '#FFFFFF',
              },
            ]}>
            {network === 'mtn_momo' ? 'M' : 'T'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mark: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  markText: {
    fontWeight: '800',
  },
});
