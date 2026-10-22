import { useMemo } from 'react';
import { useK8sWatchResource } from '~/k8s';
import { NUDGE_CONFIG_NAME, NudgeConfigGVK, NudgeConfigModel } from '~/models/nudge-config';
import { NudgeConfigKind, NudgeConfigNudge } from '~/types/nudge-config';

/**
 * Fetches the singleton NudgeConfig resource for the namespace.
 *
 * Returns [nudgeConfig, loaded, error].
 * When the CRD is not installed on the cluster (404), loaded=true and nudgeConfig=null
 * so callers degrade gracefully without showing an error state.
 */
export const useNudgeConfig = (
  namespace: string,
): [NudgeConfigKind | null, boolean, unknown] => {
  const { data, isLoading, error } = useK8sWatchResource<NudgeConfigKind>(
    namespace
      ? {
          groupVersionKind: NudgeConfigGVK,
          namespace,
          name: NUDGE_CONFIG_NAME,
        }
      : undefined,
    NudgeConfigModel,
  );

  return useMemo(() => {
    // Treat a missing CRD / 404 as "no nudges configured" rather than an error.
    const is404 =
      error != null &&
      typeof error === 'object' &&
      (error as { code?: number }).code === 404;

    if (is404) {
      return [null, true, null];
    }

    if (!isLoading && !error && data?.metadata?.deletionTimestamp) {
      return [null, !isLoading, { code: 404 }];
    }

    return [data ?? null, !isLoading, error];
  }, [data, isLoading, error]);
};

/**
 * Returns all nudges where the given component is the source (`from` side).
 */
export const useOutboundNudges = (
  namespace: string,
  componentName: string,
): [NudgeConfigNudge[], boolean, unknown] => {
  const [nudgeConfig, loaded, error] = useNudgeConfig(namespace);

  return useMemo(() => {
    const nudges = (nudgeConfig?.spec?.nudges ?? []).filter((n) => n.from === componentName);
    return [nudges, loaded, error];
  }, [nudgeConfig, loaded, error, componentName]);
};

/**
 * Returns all nudges where the given component is the target (`to` side).
 */
export const useInboundNudges = (
  namespace: string,
  componentName: string,
): [NudgeConfigNudge[], boolean, unknown] => {
  const [nudgeConfig, loaded, error] = useNudgeConfig(namespace);

  return useMemo(() => {
    const nudges = (nudgeConfig?.spec?.nudges ?? []).filter((n) => n.to === componentName);
    return [nudges, loaded, error];
  }, [nudgeConfig, loaded, error, componentName]);
};

/**
 * Returns all nudges that involve any component in the given application.
 * Requires a list of component names belonging to the application.
 */
export const useApplicationNudges = (
  namespace: string,
  componentNames: string[],
): [NudgeConfigNudge[], boolean, unknown] => {
  const [nudgeConfig, loaded, error] = useNudgeConfig(namespace);

  return useMemo(() => {
    const nameSet = new Set(componentNames);
    const nudges = (nudgeConfig?.spec?.nudges ?? []).filter(
      (n) => nameSet.has(n.from) || nameSet.has(n.to),
    );
    return [nudges, loaded, error];
  }, [nudgeConfig, loaded, error, componentNames]);
};
