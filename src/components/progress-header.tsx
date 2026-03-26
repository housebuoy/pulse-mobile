import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';


interface TopProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onSkip?: () => void;
  showSkip?: boolean;
}

interface FormHeadingProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}

export function TopProgressBar({ currentStep, totalSteps, onSkip, showSkip = true }: TopProgressBarProps) {
  const router = useRouter();
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleSkip = () => {
    if (onSkip) onSkip();
    else router.replace('/(tabs)/home');
  };

  return (
    <View style={navStyles.container}>
      <View style={navStyles.row}>
        <TouchableOpacity onPress={() => router.back()} style={navStyles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        {showSkip && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={navStyles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={navStyles.progressBar}>
        <View style={[navStyles.progressFill, { width: `${progressPercentage}%` }]} />
      </View>
    </View>
  );
}

export function FormHeading({ currentStep, totalSteps, title, subtitle }: FormHeadingProps) {
  return (
    <View style={headingStyles.container}>
      <Text style={headingStyles.stepLabel}>Step {currentStep} of {totalSteps}</Text>
      <Text style={headingStyles.title}>{title}</Text>
      <Text style={headingStyles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const navStyles = StyleSheet.create({
  container: { width: '100%', marginTop: 16, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { padding: 8, marginLeft: -8 },
  skipText: { color: '#9CA3AF', fontWeight: '600' },
  progressBar: { width: '100%', height: 8, backgroundColor: '#F3F4F6', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 999 },
});

const headingStyles = StyleSheet.create({
  container: { marginBottom: 32, marginTop: 8 },
  stepLabel: { fontSize: 12, fontWeight: '700', color: COLORS.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { color: '#6B7280', fontSize: 15, lineHeight: 24 },
});