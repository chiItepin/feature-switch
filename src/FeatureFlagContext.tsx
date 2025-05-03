import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';

export type FeatureFlagMap = {
  [key: string]: boolean;
};

const FeatureFlagContext = createContext<FeatureFlagMap>({});

type FeatureFlagProviderProps<T extends FeatureFlagMap> = {
  readonly source: 'local' | 'remote';
  readonly defaultFeatures: T;
  readonly children: ReactNode;
  readonly featureFlagsKeyStorage?: string;
  readonly fetchFeatureFlags?: () => Promise<T[]>;
  /**
   * Optional cache expiration time in milliseconds.
   * Default is 24 hours (24 * 60 * 60 * 1000).
   */
  readonly cacheExpirationTime?: number;
  /**
   * Optional function to format the feature flags fetched from the remote source.
   * This function should return a map of feature flags.
   */
  readonly formatFeatureFlags?: (flags: any) => FeatureFlagMap;
};

interface LocalStorageFlags {
  readonly flags: FeatureFlagMap;
  readonly timestamp: number;
}

const getFlagControl = (flag: any): boolean => {
  if (typeof flag === 'boolean') {
    return flag;
  }

  return false;
};

const getNormalizedFeatureFlags = (flags: Record<string, any>): FeatureFlagMap => {
  return Object.entries(flags).reduce((acc: FeatureFlagMap, [key, value]) => {
    acc[key] = getFlagControl(value);
    return acc;
  }, {});
};

const isCacheValid = (timestamp: number, cacheExpirationTime: number) =>
  Date.now() - timestamp < cacheExpirationTime;

export const FeatureFlagProvider = <T extends FeatureFlagMap>({
  defaultFeatures,
  children,
  source,
  featureFlagsKeyStorage = 'featureFlags',
  fetchFeatureFlags,
  cacheExpirationTime = 24 * 60 * 60 * 1000, // Default 24 hours expiration
  formatFeatureFlags,
}: FeatureFlagProviderProps<T>) => {
  const isBrowser = typeof window !== 'undefined';

  const storedFlags =
    isBrowser && source === 'remote' ? localStorage.getItem(featureFlagsKeyStorage) : null;
  const defaultStoredFlags = storedFlags
    ? {
        ...defaultFeatures,
        ...JSON.parse(storedFlags).flags,
      }
    : defaultFeatures;

  const [featureFlags, setFeatureFlags] = useState<FeatureFlagMap>(defaultStoredFlags);

  useEffect(() => {
    if (source === 'remote' && fetchFeatureFlags) {
      const storedFlags = isBrowser ? localStorage.getItem(featureFlagsKeyStorage) : null;

      if (storedFlags) {
        const parsedFlags = JSON.parse(storedFlags) as LocalStorageFlags;

        if (isCacheValid(parsedFlags.timestamp, cacheExpirationTime)) {
          setFeatureFlags(parsedFlags.flags);
          return;
        }
      }

      // If cache is expired or not available, fetch remote flags
      fetchFeatureFlags().then(remoteFlags => {
        const normalizedFlags = remoteFlags.reduce((acc: FeatureFlagMap, flag) => {
          const formattedFlag = formatFeatureFlags
            ? formatFeatureFlags(flag)
            : getNormalizedFeatureFlags(flag);
          return { ...acc, ...formattedFlag };
        }, {});

        const timestamp = Date.now();

        if (isBrowser) {
          localStorage.setItem(
            featureFlagsKeyStorage,
            JSON.stringify({ flags: normalizedFlags, timestamp })
          );
        }

        // Update state with remote flags
        setFeatureFlags(normalizedFlags);
      });
    } else if (source === 'local') {
      const updatedFeatureFlags = getNormalizedFeatureFlags(defaultFeatures);
      setFeatureFlags(updatedFeatureFlags);
    }
  }, [defaultFeatures, source, fetchFeatureFlags, cacheExpirationTime, formatFeatureFlags]);

  return <FeatureFlagContext.Provider value={featureFlags}>{children}</FeatureFlagContext.Provider>;
};

export const useFeatureFlags = <T extends FeatureFlagMap = FeatureFlagMap>(): T =>
  useContext(FeatureFlagContext) as T;
