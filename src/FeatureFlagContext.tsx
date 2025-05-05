import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';

type FeatureFlagMap = Record<string, any>;
interface FeatureFlagContextValue<T extends FeatureFlagMap = FeatureFlagMap> {
  readonly flags: T;
  readonly getSource: () => 'local' | 'remote';
  readonly refetchFlags: () => void;
  /**
   * Optional function to *override* a specific feature flag.
   */
  readonly overrideFlag: (key: keyof T, value: T[keyof T]) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue<any>>({
  flags: {},
  getSource: () => 'local',
  refetchFlags: () => {},
  overrideFlag: () => {},
});

type FeatureFlagProviderProps<T = FeatureFlagMap, Fetched = T> = {
  readonly source: 'local' | 'remote';
  readonly defaultFeatures: T;
  readonly children: ReactNode;
  readonly featureFlagsKeyStorage?: string;
  readonly fetchFeatureFlags?: () => Promise<Fetched>;
  readonly onFetchFeatureFlagsError?: (error: Error) => void;
  readonly onFetchFeatureFlagsSuccess?: () => void;
  /**
   * Optional function to refetch feature flags from the remote source manually.
   */
  readonly refetchFlags?: () => Promise<void>;
  /**
   * Optional cache expiration time in milliseconds.
   * Default is 24 hours (24 * 60 * 60 * 1000).
   */
  readonly cacheExpirationTime?: number;
  /**
   * Optional function to format the feature flags fetched from the remote source.
   * This function should return a map of feature flags.
   */
  readonly formatFeatureFlags?: (flags: Fetched) => T;
};

interface LocalStorageFlags<T = FeatureFlagMap> {
  readonly flags: T;
  readonly timestamp: number;
}

const isCacheValid = (timestamp: number, cacheExpirationTime: number) =>
  Date.now() - timestamp < cacheExpirationTime;

export const FeatureFlagProvider = <T extends Record<any, any>, Fetched = T>({
  defaultFeatures,
  children,
  source,
  featureFlagsKeyStorage = 'featureFlags',
  fetchFeatureFlags,
  onFetchFeatureFlagsError,
  onFetchFeatureFlagsSuccess,
  cacheExpirationTime = 24 * 60 * 60 * 1000, // Default 24 hours expiration or 1 min: 60 * 1000
  formatFeatureFlags,
}: FeatureFlagProviderProps<T, Fetched>) => {
  const isBrowser = typeof window !== 'undefined';

  const storedFlags =
    isBrowser && source === 'remote' ? localStorage.getItem(featureFlagsKeyStorage) : null;
  const defaultStoredFlags = storedFlags
    ? {
        ...defaultFeatures,
        ...JSON.parse(storedFlags).flags,
      }
    : defaultFeatures;

  const [featureFlags, setFeatureFlags] = useState<T>(defaultStoredFlags);
  const storedFlagsSourceRef = useRef<'local' | 'remote'>(source);

  const getSource = useCallback(() => storedFlagsSourceRef.current, []);

  const refetchFlags = useCallback(() => {
    if (source === 'remote' && fetchFeatureFlags) {
      fetchFeatureFlags()
        .then(remoteFlags => {
          const normalizedFlags = formatFeatureFlags
            ? formatFeatureFlags(remoteFlags)
            : remoteFlags;

          const timestamp = Date.now();

          if (isBrowser) {
            localStorage.setItem(
              featureFlagsKeyStorage,
              JSON.stringify({ flags: normalizedFlags, timestamp })
            );
          }

          // Update state with remote flags
          setFeatureFlags(normalizedFlags as T);
          storedFlagsSourceRef.current = 'remote';
          onFetchFeatureFlagsSuccess?.();
        })
        .catch(error => {
          console.error('Error fetching feature flags:', error);
          onFetchFeatureFlagsError?.(error);
        });
    } else {
      console.warn(
        'Refetching feature flags is only available for remote source with a fetchFeatureFlags function.'
      );
    }
  }, [
    fetchFeatureFlags,
    formatFeatureFlags,
    onFetchFeatureFlagsError,
    onFetchFeatureFlagsSuccess,
    source,
    featureFlagsKeyStorage,
  ]);

  const overrideFlag: NonNullable<FeatureFlagContextValue<T>['overrideFlag']> = useCallback(
    (key, value) => {
      setFeatureFlags(prevFlags => ({
        ...prevFlags,
        [key]: value,
      }));
    },
    []
  );

  useEffect(() => {
    if (source === 'remote' && fetchFeatureFlags) {
      const storedFlags = isBrowser ? localStorage.getItem(featureFlagsKeyStorage) : null;

      if (storedFlags) {
        const parsedFlags = JSON.parse(storedFlags) as LocalStorageFlags<T>;

        if (isCacheValid(parsedFlags.timestamp, cacheExpirationTime)) {
          setFeatureFlags(parsedFlags.flags);
          storedFlagsSourceRef.current = 'local';
          return;
        }
      }

      refetchFlags();
    } else if (source === 'local') {
      const updatedFeatureFlags = formatFeatureFlags
        ? formatFeatureFlags(defaultFeatures)
        : defaultFeatures;
      setFeatureFlags(updatedFeatureFlags);
    }
  }, [
    defaultFeatures,
    source,
    fetchFeatureFlags,
    onFetchFeatureFlagsError,
    onFetchFeatureFlagsSuccess,
    refetchFlags,
    cacheExpirationTime,
    formatFeatureFlags,
  ]);

  const contextValue: FeatureFlagContextValue<T> = useMemo(() => {
    return {
      flags: featureFlags,
      refetchFlags,
      overrideFlag,
      getSource,
    };
  }, [featureFlags, getSource, refetchFlags, overrideFlag]);

  return <FeatureFlagContext.Provider value={contextValue}>{children}</FeatureFlagContext.Provider>;
};

export const useFeatureFlags = <T extends Record<string, any>>(): FeatureFlagContextValue<T> =>
  useContext(FeatureFlagContext) as FeatureFlagContextValue<T>;

export const useFeatureFlag = <T extends Record<string, any>>(
  key: keyof T
): T[keyof T] | undefined => {
  const { flags } = useFeatureFlags<T>();
  return flags[key];
};
