import { K8sModelCommon, K8sGroupVersionKind } from '../types/k8s';

export const EventModel: K8sModelCommon = {
  apiVersion: 'v1',
  plural: 'events',
  namespaced: true,
  kind: 'Event',
};

export const EventGroupVersionKind: K8sGroupVersionKind = {
  version: 'v1',
  kind: 'Event',
};
