import React, { useRef, CSSProperties } from 'react';
import { useFeatureFlags } from './FeatureFlagContext';

const regularButtonStyle: CSSProperties = {
  backgroundColor: 'white',
  border: '2px solid #333',
  color: '#333',
  padding: '6px 12px',
  borderRadius: 2,
  cursor: 'pointer',
};

const panelButtonStyle: CSSProperties = {
  position: 'fixed',
  bottom: 10,
  right: 10,
  zIndex: 1000,
  ...regularButtonStyle,
};

interface FeatureFlagsDebugPanelProps {
  readonly shouldShow?: boolean;
}

export const FeatureFlagsDebugPanel = <T extends Record<string, any>>({
  shouldShow,
}: FeatureFlagsDebugPanelProps) => {
  const { flags, overrideFlag } = useFeatureFlags<T>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const toggleDialog = () => {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    } else {
      dialogRef.current?.showModal();
    }
  };

  const renderEditor = (key: string, value: any) => {
    const isBoolean = typeof value === 'boolean';

    const changeFlag = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isBoolean) {
        overrideFlag?.(key as keyof T, event.target.checked as T[keyof T]);
      } else {
        try {
          const parsed = JSON.parse(event.target.value);
          overrideFlag?.(key as keyof T, parsed);
        } catch {
          console.error('Invalid JSON format for flag value');
        }
      }
    };

    if (isBoolean) {
      return (
        <details>
          <summary>{key}</summary>
          <button
            type="button"
            onClick={() => overrideFlag?.(key as keyof T, !value as T[keyof T])}
            style={{ ...regularButtonStyle, marginTop: '8px' }}
            aria-label={`Toggle ${key}`}
          >
            {value ? 'Disable' : 'Enable'}
          </button>
        </details>
      );
    }

    return (
      <details>
        <summary>{key}</summary>
        <input
          type="text"
          defaultValue={JSON.stringify(value)}
          onBlur={changeFlag}
          style={{ width: '100%', marginTop: '8px' }}
        />
      </details>
    );
  };

  if (process.env.NODE_ENV !== 'development' && !shouldShow) {
    return null;
  }

  return (
    <>
      <button
        onClick={toggleDialog}
        style={panelButtonStyle}
        className="debug-panel-button"
        aria-label="Feature Flags Debug Panel"
      >
        🧪
      </button>
      <dialog ref={dialogRef} className="dialog-debug">
        <div className="dialog-debug-body">
          <h3>Feature Flags Debug Panel</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(flags).map(([key, value]) => (
              <li key={key} style={{ marginBottom: '12px' }}>
                {renderEditor(key, value)}
              </li>
            ))}
          </ul>
          <button type="button" style={regularButtonStyle} onClick={toggleDialog}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
};
