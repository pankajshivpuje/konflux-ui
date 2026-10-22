import { K8sGroupVersionKind, K8sModelCommon } from '~/types/k8s';

export const NudgeConfigModel: K8sModelCommon = {
  apiGroup: 'appstudio.redhat.com',
  apiVersion: 'v1alpha1',
  kind: 'NudgeConfig',
  plural: 'nudgeconfigs',
  namespaced: true,
};

export const NudgeConfigGVK: K8sGroupVersionKind = {
  group: NudgeConfigModel.apiGroup,
  version: NudgeConfigModel.apiVersion,
  kind: NudgeConfigModel.kind,
};

/** The singleton NudgeConfig resource name per namespace. */
export const NUDGE_CONFIG_NAME = 'nudge-config';
