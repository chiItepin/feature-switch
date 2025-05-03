# Feature Switch

Feature Switch is a React-based library for managing feature flags in your application. It supports both local and remote feature flag sources, with caching and normalization capabilities.

## Features
- Local and remote feature flag management
- Caching with expiration
- Normalization of feature flag values

## Installation

```bash
npm install feature-switch
```

## Usage

### Basic Example

```tsx
import React from 'react';
import { FeatureFlagProvider, useFeatureFlags } from 'feature-switch';

const App = () => {
  const featureFlags = useFeatureFlags();

  return (
    <div>
      {featureFlags.featureA && <p>Feature A is enabled</p>}
    </div>
  );
};

export default () => (
  <FeatureFlagProvider source="local" defaultFeatures={{ featureA: true }}>
    <App />
  </FeatureFlagProvider>
);
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.