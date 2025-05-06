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

### Server-Side Rendering (SSR) Usage

To support SSR (e.g., in Next.js), you can fetch and pass flags to the FeatureFlagProvider using the defaultFeatures prop.

```tsx
export async function getServerSideProps() {
  const res = await fetch('https://your-api.com/feature-flags');
  const flags = await res.json();

  return {
    props: {
      initialFlags: flags,
    },
  };
}
```

## Output of `useFeatureFlags`

The `useFeatureFlags` hook provides access to the current feature flags and utility functions for managing them.

### Return Value

The hook returns an object with the following properties:

| Property         | Type                          | Description                                                                 |
|------------------|-------------------------------|-----------------------------------------------------------------------------|
| `flags`          | `Record<string, any>`         | The current feature flags and their values.                                |
| `getSource`      | `() => 'local' | 'remote'`  | A function to get the source of the feature flags (local or remote).       |
| `refetchFlags`   | `() => void` (optional)       | A function to manually refetch feature flags from the remote source.       |
| `overrideFlag`   | `(key: string, value: any) => void` (optional) | A function to override a specific feature flag value.                      |

### Example

```tsx
const { flags, getSource, refetchFlags, overrideFlag } = useFeatureFlags();

console.log(flags); // { featureA: true, featureB: false }
console.log(getSource()); // 'local'

// Override a flag
overrideFlag?.('featureA', false);

// Refetch flags (only available for remote source)
refetchFlags?.();
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

## Debug Panel

The `FeatureFlagsDebugPanel` is a development tool that allows you to view and override feature flags in real-time. It is only available in development mode (`process.env.NODE_ENV === 'development'`) though it can be rendered in production if `shouldShow` is provided.

### Usage

To use the debug panel, include it within your `FeatureFlagProvider`:

```tsx
import { FeatureFlagsDebugPanel } from '@chiltepin/feature-switch';

<FeatureFlagProvider source="local" defaultFeatures={{ featureA: true }}>
  <FeatureFlagsDebugPanel />
  <App />
</FeatureFlagProvider>
```

### Features
- Displays all current feature flags and their values.
- Allows toggling feature flags on or off.
- Automatically updates the application state when a flag is changed.

### Example

```tsx
<FeatureFlagProvider source="local" defaultFeatures={{ featureA: true, featureB: false }}>
  <FeatureFlagsDebugPanel />
  <App />
</FeatureFlagProvider>
```

When the debug panel is active, a button will appear in the bottom-right corner of the screen. Clicking it opens a dialog where you can toggle feature flags.

## Acknowledgments

This library is proudly supported by [fitbite.online](https://fitbite.online), a key contributor to its development and maintenance.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.