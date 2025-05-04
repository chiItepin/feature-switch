# Feature Switch

Feature Switch is a React-based library for managing feature flags in your application. It supports both local and remote feature flag sources, with caching and normalization capabilities.

## Features
- Local and remote feature flag management
- Caching with expiration
- Normalization of feature flag values

## Installation

```bash
npm install @chiltepin/feature-switch
```

## Usage

### Basic Example

```tsx
import React from 'react';
import { FeatureFlagProvider, useFeatureFlags } from '@chiltepin/feature-switch';

const App = () => {
  const { flags: { featureA } } = useFeatureFlags();

  return (
    <div>
      {featureA && <p>Feature A is enabled</p>}
    </div>
  );
};

export default () => (
  <FeatureFlagProvider source="local" defaultFeatures={{ featureA: true }}>
    <App />
  </FeatureFlagProvider>
);
```

## Advanced Usage Examples

### Local Feature Flags

```tsx
import React from 'react';
import { FeatureFlagProvider, useFeatureFlags } from 'feature-switch';

const BasicUsage = () => {
  const {
    flags: { welcome },
  } = useFeatureFlags();
  return <h1>{welcome ? 'Welcome Enabled' : 'Welcome Disabled'}</h1>;
};

export const App = () => (
  <FeatureFlagProvider
    source="local"
    defaultFeatures={{ welcome: false, anotherFeature: false }}
  >
    <BasicUsage />
  </FeatureFlagProvider>
);
```

### Remote Feature Flags

```tsx
const fetchFakeFeatureFlags = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ welcome: true, anotherFeature: false });
    }, 3000);
  });
};

export const App = () => (
  <FeatureFlagProvider
    source="remote"
    defaultFeatures={{ welcome: false, anotherFeature: false }}
    fetchFeatureFlags={fetchFakeFeatureFlags}
  >
    <BasicUsage />
  </FeatureFlagProvider>
);
```

### Custom Formatting

```tsx
const fetchFakeFeatureFlagsWithCustomFormat = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ welcome: { enabled: true }, anotherFeature: { enabled: false } });
    }, 3000);
  });
};

const CustomFormatUsage = () => {
  const {
    flags: { welcome },
  } = useFeatureFlags();
  return <h1>{welcome.enabled ? 'Flag is Enabled' : 'Flag is Disabled'}</h1>;
};

export const App = () => (
  <FeatureFlagProvider
    source="remote"
    defaultFeatures={{ welcome: { enabled: false }, anotherFeature: { enabled: false } }}
    fetchFeatureFlags={fetchFakeFeatureFlagsWithCustomFormat}
  >
    <CustomFormatUsage />
  </FeatureFlagProvider>
);
```

### Custom Normalization

```tsx
export const App = () => (
  <FeatureFlagProvider<Flags, CustomFormatFlags>
    source="remote"
    defaultFeatures={{ welcome: false, anotherFeature: false }}
    fetchFeatureFlags={fetchFakeFeatureFlagsWithCustomFormat}
    formatFeatureFlags={flags => ({
      welcome: flags.welcome.enabled,
      anotherFeature: flags.anotherFeature.enabled,
    })}
  >
    <BasicUsage />
  </FeatureFlagProvider>
);
```

### FeatureFlagProvider Props

| Prop Name                | Type                          | Description                                                                                     |
|--------------------------|-------------------------------|-------------------------------------------------------------------------------------------------|
| `source`                 | `'local' | 'remote'`          | Specifies the source of the feature flags.                                                     |
| `defaultFeatures`        | `Record<string, any>`         | The default feature flags to use.                                                              |
| `children`               | `ReactNode`                  | The child components to render within the provider.                                             |
| `featureFlagsKeyStorage` | `string`                     | (Optional) The key used to store feature flags in localStorage. Default is `'featureFlags'`.    |
| `fetchFeatureFlags`      | `() => Promise<Record>`      | (Optional) A function to fetch feature flags from a remote source.                              |
| `onFetchFeatureFlagsError` | `(error: Error) => void`    | (Optional) Callback invoked when fetching feature flags fails.                                  |
| `onFetchFeatureFlagsSuccess` | `() => void`             | (Optional) Callback invoked when fetching feature flags succeeds.                               |
| `cacheExpirationTime`    | `number`                     | (Optional) Cache expiration time in milliseconds. Default is 24 hours.                         |
| `formatFeatureFlags`     | `(flags: any) => Record`     | (Optional) Function to format the fetched feature flags.                                        |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.