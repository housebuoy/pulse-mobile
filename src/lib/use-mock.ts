/** Unset or any value other than "false" keeps the app on store seeds. */
export function isMockMode(): boolean {
  return process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
}
