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
          <span data-testid="featureA">{featureFlags.featureA.toString()}</span>
          <span data-testid="featureB">{featureFlags.featureB.toString()}</span>
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

  it('provides normalized feature flags when source is local', () => {
    // @ts-expect-error
    const defaultFeatures: FeatureFlagMap = { featureA: true, featureB: 'invalid' };

    const TestComponent = () => {
      const featureFlags = useFeatureFlags();
      return (
        <div>
          <span data-testid="featureA">{featureFlags.featureA.toString()}</span>
          <span data-testid="featureB">{featureFlags.featureB.toString()}</span>
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
