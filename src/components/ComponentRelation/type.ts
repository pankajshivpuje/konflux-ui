export enum NudgeContext {
  component = 'component',
  application = 'application',
}

export enum ComponentRelationNudgeType {
  NUDGES = 'nudges',
  NUDGED_BY = 'nudges-by',
}

export type ComponentRelationValue = {
  source: string;
  nudgeType: ComponentRelationNudgeType;
  target: string[];
  /** ADR 0067: how the nudge fires once the source build completes. */
  mode: 'immediate' | 'validated';
  /** ADR 0067: ComponentGroup name used as the gate (required when mode is validated). */
  gatingGroup?: string;
};

export type ComponentRelationFormikValue = {
  relations: ComponentRelationValue[];
};
