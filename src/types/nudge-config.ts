import { ResourceStatusCondition } from './common-types';
import { K8sResourceCommon } from './k8s';

export type NudgeMode = 'immediate' | 'validated';

export type NudgeConfigNudge = {
  /** Component name that triggers the nudge (the source). */
  from: string;
  /** Component name that receives the nudge (the target). */
  to: string;
  /**
   * `immediate` — nudge fires as soon as the source build completes.
   * `validated` — nudge is gated on the referenced ComponentGroup passing tests.
   */
  mode: NudgeMode;
  /** ComponentGroup name used as the gate; required when mode is `validated`. */
  gatingGroup?: string;
};

export type NudgeConfigSpec = {
  nudges?: NudgeConfigNudge[];
};

export type NudgeConfigStatus = {
  /** Controller-written conditions, e.g. stale `from`/`to` references. */
  conditions?: ResourceStatusCondition[];
};

export type NudgeConfigKind = K8sResourceCommon & {
  spec: NudgeConfigSpec;
  status?: NudgeConfigStatus;
};
