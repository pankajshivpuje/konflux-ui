import { ConfigMap } from './configmap';

export type SystemStatus = 'operational' | 'degraded' | 'outage';

export type ServiceStatus = {
  name: string;
  status: SystemStatus;
  message?: string;
};

export type KonfluxStatus = {
  status: SystemStatus;
  message?: string;
  lastUpdated?: string;
  statusPageUrl?: string;
  services?: ServiceStatus[];
};

export type KonfluxStatusConfigMap = ConfigMap & { data: { 'status.json': string } };
