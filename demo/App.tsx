import React, { FC } from 'react';
import { FeatureFlagProvider, useFeatureFlags, useFeatureFlag } from '../src';

interface Flags {
  readonly welcome: boolean;
  readonly anotherFeature: boolean;
}

const BasicUsage: FC = () => {
  const {
    flags: { welcome },
  } = useFeatureFlags<Flags>();
  return <h1>{welcome ? 'Welcome Enabled' : 'Welcome Disabled'}</h1>;
};

const fetchFakeFeatureFlags = async (): Promise<Flags> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ welcome: true, anotherFeature: false });
    }, 3000);
  });
};

interface CustomFormatFlags {
  readonly welcome: { enabled: boolean };
  readonly anotherFeature: { enabled: boolean };
}

const fetchFakeFeatureFlagsWithCustomFormat = async (): Promise<CustomFormatFlags> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ welcome: { enabled: true }, anotherFeature: { enabled: false } });
    }, 3000);
  });
};

const CustomFormatUsage: FC = () => {
  const welcomeFlag = useFeatureFlag<CustomFormatFlags>('welcome')?.enabled;
  return <h1>{welcomeFlag ? 'Flag is Enabled' : 'Flag is Disabled'}</h1>;
};

export const App = () => (
  <>
    <h1>Feature Flag Example</h1>
    <p>With local feature flags:</p>
    <FeatureFlagProvider<Flags>
      source="local"
      defaultFeatures={{ welcome: false, anotherFeature: false }}
    >
      <BasicUsage />
    </FeatureFlagProvider>
    <p>With remote feature flags -- fetching from a fake API:</p>
    <FeatureFlagProvider<Flags>
      source="remote"
      defaultFeatures={{ welcome: false, anotherFeature: false }}
      fetchFeatureFlags={fetchFakeFeatureFlags}
    >
      <BasicUsage />
    </FeatureFlagProvider>
    <p>With remote feature flags -- custom formatting:</p>
    <FeatureFlagProvider<CustomFormatFlags>
      source="remote"
      defaultFeatures={{ welcome: { enabled: false }, anotherFeature: { enabled: false } }}
      featureFlagsKeyStorage="featureFlags-custom"
      fetchFeatureFlags={fetchFakeFeatureFlagsWithCustomFormat}
    >
      <CustomFormatUsage />
    </FeatureFlagProvider>
    <p>With remote feature flags -- custom normalization:</p>
    <FeatureFlagProvider<Flags, CustomFormatFlags>
      source="remote"
      defaultFeatures={{ welcome: false, anotherFeature: false }}
      featureFlagsKeyStorage="featureFlags-custom-2"
      fetchFeatureFlags={fetchFakeFeatureFlagsWithCustomFormat}
      formatFeatureFlags={flags => ({
        welcome: flags.welcome.enabled,
        anotherFeature: flags.anotherFeature.enabled,
      })}
    >
      <BasicUsage />
    </FeatureFlagProvider>
  </>
);
