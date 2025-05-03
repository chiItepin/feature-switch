import React, { FC } from 'react';
import { FeatureFlagProvider, useFeatureFlags, FeatureFlagMap } from '../src';

interface Flags extends FeatureFlagMap {
  readonly welcome: boolean;
  readonly anotherFeature: boolean;
}

const Hello: FC = () => {
  const {
    flags: { welcome },
  } = useFeatureFlags<Flags>();
  return <h1>{welcome ? 'Welcome Enabled' : 'Welcome Disabled'}</h1>;
};

const fetchFakeFeatureFlags = async (): Promise<FeatureFlagMap[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([{ welcome: true, anotherFeature: false }]);
    }, 3000);
  });
};

export const App = () => (
  <FeatureFlagProvider
    source="remote"
    defaultFeatures={{ welcome: false }}
    fetchFeatureFlags={fetchFakeFeatureFlags}
  >
    <Hello />
  </FeatureFlagProvider>
);
