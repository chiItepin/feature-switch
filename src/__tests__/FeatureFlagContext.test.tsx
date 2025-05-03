import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider, useFeatureFlags, FeatureFlagMap } from '../FeatureFlagContext';

describe('FeatureFlagContext', () => {
  it('provides default feature flags when source is local', () => {
    const defaultFeatures = { featureA: true, featureB: false };

    const TestComponent = () => {
      const featureFlags = useFeatureFlags();
      return (
        <div>
          <span data-testid="featureA">{featureFlags.flags.featureA.toString()}</span>
          <span data-testid="featureB">{featureFlags.flags.featureB.toString()}</span>
        </div>
      );
    };

    render(
      <FeatureFlagProvider source="local" defaultFeatures={defaultFeatures}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('featureA').textContent).toBe('true');
    expect(screen.getByTestId('featureB').textContent).toBe('false');
  });
});
