import type { ImageSourcePropType } from 'react-native';

/**
 * Hospital card / hero image resolution.
 *
 * The live demo backend returns `image: null` for every hospital (the
 * hospitals table has no image column — only logo_url, also null), so without
 * this every card used to fall back to ONE shared Unsplash facility photo.
 * Hospitals with a bundled photo render it from the app bundle (instant, no
 * network round-trip); any hospital without one gets the remote fallback.
 *
 * Resolution order: server image URL (when the backend starts shipping real
 * art) → bundled asset for known ids → generic remote fallback.
 */

const FALLBACK_URL =
  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800&auto=format&fit=crop';

/** Bundled facility photos keyed by the /mobile/hospitals id. */
const LOCAL_BY_ID: Record<string, number> = {
  // Korle Bu Teaching Hospital (flagship 24/7 facility) → night ER entrance.
  '1': require('../../assets/hospitals/facility-night-emergency.jpg'),
  // KNUST University Hospital → modern campus entrance.
  '3': require('../../assets/hospitals/facility-modern-campus.jpg'),
};

export function resolveHospitalImage(
  id: string | number | null | undefined,
  remoteUrl?: string | null
): ImageSourcePropType {
  if (remoteUrl && remoteUrl.trim().length > 0) {
    return { uri: remoteUrl };
  }
  const key = id == null ? '' : String(id);
  const local = LOCAL_BY_ID[key];
  if (local) return local;
  return { uri: FALLBACK_URL };
}
