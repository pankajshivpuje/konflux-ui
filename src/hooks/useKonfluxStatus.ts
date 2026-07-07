import React from 'react';
import { useK8sWatchResource } from '../k8s';
import { ConfigMapGroupVersionKind, ConfigMapModel } from '../models';
import { KonfluxStatus, KonfluxStatusConfigMap } from '../types/konflux-status';

const FALLBACK_STATUS_PAGE_URL = 'https://status.redhat.com';

export const useKonfluxStatus = (): [KonfluxStatus | null, boolean, unknown] => {
  const {
    data: configMap,
    isLoading,
    error,
  } = useK8sWatchResource<KonfluxStatusConfigMap>(
    {
      groupVersionKind: ConfigMapGroupVersionKind,
      namespace: 'konflux-info',
      name: 'konflux-status',
    },
    ConfigMapModel,
    {
      staleTime: 30_000,
    },
  );

  const parsedData = React.useMemo<KonfluxStatus | null>(() => {
    if (isLoading || error || !configMap?.data?.['status.json']) {
      return null;
    }
    try {
      const parsed: KonfluxStatus = JSON.parse(configMap.data['status.json']);
      return {
        ...parsed,
        statusPageUrl: parsed.statusPageUrl || FALLBACK_STATUS_PAGE_URL,
      };
    } catch {
      return null;
    }
  }, [configMap, isLoading, error]);

  return [parsedData, !isLoading, error];
};
