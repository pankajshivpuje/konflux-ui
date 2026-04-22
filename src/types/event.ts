import { K8sResourceCommon } from './k8s';

export type EventInvolvedObject = {
  apiVersion: string;
  kind: string;
  name: string;
  namespace: string;
  resourceVersion?: string;
  uid?: string;
};

export type EventKind = K8sResourceCommon & {
  count?: number;
  eventTime?: string;
  firstTimestamp?: string;
  lastTimestamp?: string;
  involvedObject: EventInvolvedObject;
  message?: string;
  reason?: string;
  reportingComponent?: string;
  reportingInstance?: string;
  source?: {
    component?: string;
    host?: string;
  };
  type?: 'Normal' | 'Warning';
};
