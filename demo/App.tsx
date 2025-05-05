import React, { FC, useState } from 'react';
import {
  FeatureFlagProvider,
  useFeatureFlags,
  useFeatureFlag,
  FeatureFlagsDebugPanel,
} from '../src';

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

export const App = () => {
  const [currentUsage, setCurrentUsage] = useState(0);

  const usages = [
    {
      title: 'With local feature flags:',
      component: (
        <FeatureFlagProvider<Flags>
          source="local"
          defaultFeatures={{ welcome: false, anotherFeature: false }}
        >
          <BasicUsage />
        </FeatureFlagProvider>
      ),
    },
    {
      title: 'With debug panel:',
      component: (
        <FeatureFlagProvider<Flags>
          source="local"
          defaultFeatures={{ welcome: false, anotherFeature: false }}
        >
          <FeatureFlagsDebugPanel<Flags> />
          <BasicUsage />
        </FeatureFlagProvider>
      ),
    },
    {
      title: 'With remote feature flags -- fetching from a fake API:',
      component: (
        <FeatureFlagProvider<Flags>
          source="remote"
          defaultFeatures={{ welcome: false, anotherFeature: false }}
          fetchFeatureFlags={fetchFakeFeatureFlags}
        >
          <BasicUsage />
        </FeatureFlagProvider>
      ),
    },
    {
      title: 'With remote feature flags -- custom formatting:',
      component: (
        <FeatureFlagProvider<CustomFormatFlags>
          source="remote"
          defaultFeatures={{ welcome: { enabled: false }, anotherFeature: { enabled: false } }}
          featureFlagsKeyStorage="featureFlags-custom-format"
          fetchFeatureFlags={fetchFakeFeatureFlagsWithCustomFormat}
        >
          <FeatureFlagsDebugPanel<CustomFormatFlags> />
          <CustomFormatUsage />
        </FeatureFlagProvider>
      ),
    },
    {
      title: 'With remote feature flags -- custom normalization:',
      component: (
        <FeatureFlagProvider<Flags, CustomFormatFlags>
          source="remote"
          defaultFeatures={{ welcome: false, anotherFeature: false }}
          featureFlagsKeyStorage="featureFlags-custom-normalization"
          fetchFeatureFlags={fetchFakeFeatureFlagsWithCustomFormat}
          formatFeatureFlags={flags => ({
            welcome: flags.welcome.enabled,
            anotherFeature: flags.anotherFeature.enabled,
          })}
        >
          <BasicUsage />
        </FeatureFlagProvider>
      ),
    },
  ];

  const goToPrevDemo = () => {
    setCurrentUsage(prev => (prev > 0 ? prev - 1 : usages.length - 1));
  };

  const goToNextDemo = () => {
    setCurrentUsage(prev => (prev < usages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <h1>Feature Flag Example</h1>
      <p>{usages[currentUsage].title}</p>
      {usages[currentUsage].component}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={goToPrevDemo}>Previous</button>
        <button onClick={goToNextDemo}>Next</button>
      </div>
    </>
  );
};
