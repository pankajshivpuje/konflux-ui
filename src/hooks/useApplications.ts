import * as React from 'react';
import { useK8sWatchResource } from '../k8s';
import { ApplicationGroupVersionKind, ApplicationModel } from '../models';
import { ApplicationKind } from '../types';
import { USE_MOCK_DATA, mockApplications } from './__mock__/mock-data';

export const useApplications = (namespace: string): [ApplicationKind[], boolean, unknown] => {
  const {
    data: applications,
    isLoading,
    error,
  } = useK8sWatchResource<ApplicationKind[]>(
    USE_MOCK_DATA
      ? undefined
      : {
          groupVersionKind: ApplicationGroupVersionKind,
          namespace,
          isList: true,
        },
    ApplicationModel,
    {
      filterData: (resource) =>
        resource?.filter(
          (application: ApplicationKind) => !application.metadata?.deletionTimestamp,
        ) ?? [],
    },
  );

  if (USE_MOCK_DATA) {
    return [mockApplications, true, undefined];
  }

  return [applications, !isLoading, error];
};

export const useApplication = (
  namespace: string,
  applicationName: string,
): [ApplicationKind, boolean, unknown] => {
  const {
    data: application,
    isLoading,
    error,
  } = useK8sWatchResource<ApplicationKind>(
    USE_MOCK_DATA
      ? undefined
      : {
          groupVersionKind: ApplicationGroupVersionKind,
          name: applicationName,
          namespace,
        },
    ApplicationModel,
  );

  return React.useMemo(() => {
    if (USE_MOCK_DATA) {
      const mockApp = mockApplications.find((a) => a.metadata.name === applicationName);
      return [mockApp || null, true, mockApp ? undefined : { code: 404 }];
    }
    if (
      !isLoading &&
      !error &&
      (application as unknown as ApplicationKind)?.metadata?.deletionTimestamp
    ) {
      return [null, !isLoading, { code: 404 }];
    }
    return [application, !isLoading as unknown as boolean, error as unknown];
  }, [application, isLoading, error, applicationName]);
};
