import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureFlagProvider } from '../FeatureFlagContext';
import { FeatureFlagsDebugPanel } from '../FeatureFlagsDebugPanel';

describe('FeatureFlagsDebugPanel', () => {
  beforeEach(() => {
    window.HTMLDialogElement.prototype.showModal = jest.fn();
    window.HTMLDialogElement.prototype.close = jest.fn();
  });
  it('renders the debug panel when shouldShow is true', () => {
    render(<FeatureFlagsDebugPanel shouldShow={true} />);
    expect(screen.getByLabelText('Feature Flags Debug Panel')).toBeInTheDocument();
  });

  it('does not render the debug panel when shouldShow is false', () => {
    render(<FeatureFlagsDebugPanel shouldShow={false} />);
    expect(screen.queryByLabelText('Feature Flags Debug Panel')).not.toBeInTheDocument();
  });

  describe('when local feature flags are enabled', () => {
    const defaultFeatures = { featureA: true, featureB: false };
    it('renders the debug panel with feature flags', () => {
      render(
        <FeatureFlagProvider source="local" defaultFeatures={defaultFeatures}>
          <FeatureFlagsDebugPanel shouldShow={true} />
        </FeatureFlagProvider>
      );
      const openDialogBtn = screen.getByLabelText('Feature Flags Debug Panel');
      expect(openDialogBtn).toBeInTheDocument();

      fireEvent.click(openDialogBtn);
      expect(screen.getByText('featureA')).toBeInTheDocument();
      expect(screen.getByText('featureB')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle featureA')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle featureB')).toBeInTheDocument();

      expect(screen.getByText('Enable')).toBeInTheDocument();
      expect(screen.getByText('Disable')).toBeInTheDocument();

      const featureAInput = screen.getByLabelText('Toggle featureA');

      fireEvent.click(featureAInput);
      expect(screen.getAllByText('Enable')).toHaveLength(2);
    });
  });
});
