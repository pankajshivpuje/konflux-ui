import { K8sResourceCommon } from './k8s';

export type EventKind = K8sResourceCommon & {
  involvedObject: {
    apiVersion: string;
    kind: string;
    name: string;
    namespace: string;
    uid?: string;
    fieldPath?: string;
  };
  reason: string;
  message: string;
  type: string;
  lastTimestamp: string;
  firstTimestamp: string;
  count: number;
  source: {
    component: string;
    host?: string;
  };
};
