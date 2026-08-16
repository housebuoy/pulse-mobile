import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentNetwork } from '@/stores/payments-store';

const LOGOS = {
mtn_momo: require('../../../assets/images/momo-logo.png'),
  telecel_cash: require('../../../assets/images/telecel-cash.png'),
};

export default function NetworkBadge({
  network,
  size = 32,
}: {
  network: PaymentNetwork;
  size?: number;
}) {
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size * 0.3 }]}>
      {network === 'card' ? (
        <Ionicons name="card-outline" size={Math.round(size * 0.5)} color="#4B5563" />
      ) : (
        <Image
          source={LOGOS[network]}
          style={{ width: size * 0.7, height: size * 0.7 }}
          resizeMode="contain"
        />
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
});