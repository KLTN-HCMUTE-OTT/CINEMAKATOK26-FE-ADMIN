const FEATURES = {
  LIVE_STREAMS: process.env.NEXT_PUBLIC_FEATURE_LIVE_STREAMS === 'true',
  AI_RECOMMENDATIONS: process.env.NEXT_PUBLIC_FEATURE_AI_REC === 'true'
} as const

export type FeatureFlag = keyof typeof FEATURES

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURES[flag]
}

export function getEnabledFeatures(): FeatureFlag[] {
  return (Object.keys(FEATURES) as FeatureFlag[]).filter(flag => FEATURES[flag])
}
