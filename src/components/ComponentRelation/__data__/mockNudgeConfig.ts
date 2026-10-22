import { NUDGE_CONFIG_NAME } from '~/models/nudge-config';
import { NudgeConfigKind } from '~/types/nudge-config';

const nudgeConfigResource = {
  apiVersion: 'appstudio.redhat.com/v1alpha1',
  kind: 'NudgeConfig',
} as const;

/**
 * Returns a minimal valid NudgeConfig mock for a given namespace.
 * Covers both `immediate` and `validated` mode nudge entries.
 */
export const mockNudgeConfig = (namespace = 'test-ns'): NudgeConfigKind => ({
  ...nudgeConfigResource,
  metadata: {
    name: NUDGE_CONFIG_NAME,
    namespace,
    uid: `mock-uid-nudge-config-${namespace}`,
    resourceVersion: '1',
    creationTimestamp: '2026-10-01T00:00:00Z',
  },
  spec: {
    nudges: [
      {
        from: 'component-a',
        to: 'component-b',
        mode: 'immediate',
      },
      {
        from: 'component-a',
        to: 'component-c',
        mode: 'validated',
        gatingGroup: 'frontend-stack',
      },
      {
        from: 'component-b',
        to: 'component-d',
        mode: 'immediate',
      },
    ],
  },
  status: {
    conditions: [
      {
        type: 'Valid',
        status: 'True',
        reason: 'OK',
        message: 'All nudge references are valid',
        lastTransitionTime: '2026-10-01T00:00:00Z',
      },
    ],
  },
});

/** A NudgeConfig with a stale reference condition (component-d no longer exists). */
export const mockNudgeConfigWithStaleRef = (namespace = 'test-ns'): NudgeConfigKind => ({
  ...mockNudgeConfig(namespace),
  status: {
    conditions: [
      {
        type: 'Valid',
        status: 'False',
        reason: 'Error',
        message: 'Component "component-d" referenced in nudge does not exist',
        lastTransitionTime: '2026-10-02T00:00:00Z',
      },
    ],
  },
});

/** An empty NudgeConfig (no nudges defined yet). */
export const mockEmptyNudgeConfig = (namespace = 'test-ns'): NudgeConfigKind => ({
  ...nudgeConfigResource,
  metadata: {
    name: NUDGE_CONFIG_NAME,
    namespace,
    uid: `mock-uid-nudge-config-empty-${namespace}`,
    resourceVersion: '1',
    creationTimestamp: '2026-10-01T00:00:00Z',
  },
  spec: {
    nudges: [],
  },
});
