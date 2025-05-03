import React, {
  FC,
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';

export type FeatureFlagMap = {
  [key: string]: boolean | string;
};

interface FeatureFlagContextValue<T extends FeatureFlagMap = FeatureFlagMap> {
  readonly flags: T;
  readonly getSource: () => 'local' | 'remote';
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: {},
  getSource: () => 'local',
});

type FeatureFlagProviderProps<T = FeatureFlagMap, Fetched = T> = {
  readonly source: 'local' | 'remote';
  readonly defaultFeatures: T;
  readonly children: ReactNode;
  readonly featureFlagsKeyStorage?: string;
  readonly fetchFeatureFlags?: () => Promise<Fetched>;
  /**
   * Optional cache expiration time in milliseconds.
   * Default is 24 hours (24 * 60 * 60 * 1000).
   */
  readonly cacheExpirationTime?: number;
  /**
   * Optional function to format the feature flags fetched from the remote source.
   * This function should return a map of feature flags.
   */
  readonly formatFeatureFlags?: (flags: any) => T;
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

      // If cache is expired or not available, fetch remote flags
      fetchFeatureFlags().then(remoteFlags => {
        const normalizedFlags = formatFeatureFlags ? formatFeatureFlags(remoteFlags) : remoteFlags;

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
      });
    } else if (source === 'local') {
      const updatedFeatureFlags = formatFeatureFlags
        ? formatFeatureFlags(defaultFeatures)
        : defaultFeatures;
      setFeatureFlags(updatedFeatureFlags);
    }
  }, [defaultFeatures, source, fetchFeatureFlags, cacheExpirationTime, formatFeatureFlags]);

  const contextValue = useMemo(() => {
    return {
      flags: featureFlags,
      getSource,
    };
  }, [featureFlags, getSource]);

  return <FeatureFlagContext.Provider value={contextValue}>{children}</FeatureFlagContext.Provider>;
};

export const useFeatureFlags = <T extends Record<any, any>>(): FeatureFlagContextValue<T> =>
  useContext(FeatureFlagContext) as FeatureFlagContextValue<T>;
