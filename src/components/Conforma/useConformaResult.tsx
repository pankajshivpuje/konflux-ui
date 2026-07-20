import * as React from 'react';
import { mockIntegrationTestPipelineRuns } from '~/components/IntegrationTests/IntegrationTestDetails/tabs/__data__/mockIntegrationTestPipelineRuns';
import { CONFORMA_TASK, EC_TASK } from '~/consts/security';
import { useIsOnFeatureFlag } from '~/feature-flags/hooks';
import { usePipelineRunV2 } from '~/hooks/usePipelineRunsV2';
import { KUBEARCHIVE_PATH_PREFIX } from '~/kubearchive/const';
import { logger } from '~/monitoring/logger';
import {
  ComponentConformaResult,
  CONFORMA_RESULT_STATUS,
  ConformaResult,
  UIConformaData,
} from '~/types/conforma';
import { isResourceEnterpriseContract } from '~/utils/conforma-utils';
import { isTaskRunInPipelineRun } from '~/utils/pipeline-utils';
import { useTaskRunsForPipelineRuns } from '../../hooks/useTaskRunsV2';
import { commonFetchJSON, getK8sResourceURL } from '../../k8s';
import { PodModel } from '../../models/pod';
import { useNamespace } from '../../shared/providers/Namespace';
import { getPipelineRunFromTaskRunOwnerRef } from '../../utils/common-utils';
import { getTaskRunLog } from '../../utils/tekton-results';
import { extractConformaResultsFromTaskRunLogs } from './utils';
import { computeWarningFields } from './warning-utils';

export const useConformaResultFromLogs = (
  pipelineRunName: string,
): [ComponentConformaResult[], boolean, unknown] => {
  const namespace = useNamespace();
  const isKubearchiveEnabled = useIsOnFeatureFlag('kubearchive-logs');
  const [pipelineRun, pipelineRunLoaded, pipelineRunError] = usePipelineRunV2(
    namespace,
    pipelineRunName,
  );
  const securityTaskRunName = React.useMemo(() => {
    if (!pipelineRunLoaded || pipelineRunError) {
      return undefined;
    }

    if (isResourceEnterpriseContract(pipelineRun)) {
      return EC_TASK;
    }

    if (isTaskRunInPipelineRun(pipelineRun, CONFORMA_TASK)) {
      return CONFORMA_TASK;
    }

    return undefined;
  }, [pipelineRun, pipelineRunLoaded, pipelineRunError]);
  const [taskRuns, taskRunLoaded, taskRunError] = useTaskRunsForPipelineRuns(
    securityTaskRunName ? namespace : undefined,
    pipelineRunName,
    securityTaskRunName,
  );
  const [fetchArchive, setFetchArchive] = React.useState<boolean>(false);
  const [crJson, setCrJson] = React.useState<ConformaResult>();
  const [crLoaded, setCrLoaded] = React.useState<boolean>(false);
  const [taskRun] = taskRuns ?? [];
  const podName = taskRunLoaded && !taskRunError ? taskRun?.status?.podName : null;

  const taskRunUid = taskRun?.metadata?.uid;
  const taskRunNs = taskRun?.metadata?.namespace;
  const pipelineRunUid = taskRun?.metadata
    ? getPipelineRunFromTaskRunOwnerRef(taskRun)?.uid
    : undefined;

  const crResultOpts = React.useMemo(() => {
    return podName
      ? {
          ns: namespace,
          name: podName,
          path: 'log',
          queryParams: {
            container: 'step-report-json',
            follow: 'true',
          },
        }
      : null;
  }, [podName, namespace]);

  React.useEffect(() => {
    let unmount = false;
    if (taskRunLoaded && securityTaskRunName && !crResultOpts) {
      setFetchArchive(true);
      return;
    }
    if (crResultOpts) {
      commonFetchJSON(getK8sResourceURL(PodModel, undefined, crResultOpts))
        .then((res: ConformaResult) => {
          if (unmount) return;
          setCrJson(res);
          setCrLoaded(true);
        })
        .catch((err) => {
          if (unmount) return;
          if (err.code === 404) {
            setFetchArchive(true);
          } else {
            setCrLoaded(true);
          }
          logger.warn('Error while fetching Conforma result from logs', { error: err });
        });
    }
    return () => {
      unmount = true;
    };
  }, [crResultOpts, taskRunLoaded, securityTaskRunName]);

  React.useEffect(() => {
    let unmount = false;
    if (!fetchArchive || crLoaded) {
      return;
    }

    if (isKubearchiveEnabled && crResultOpts) {
      commonFetchJSON(getK8sResourceURL(PodModel, undefined, crResultOpts), {
        pathPrefix: KUBEARCHIVE_PATH_PREFIX,
      })
        .then((res: ConformaResult) => {
          if (unmount) return;
          setCrJson(res);
          setCrLoaded(true);
        })
        .catch((karchErr) => {
          if (unmount) return;
          setCrLoaded(true);
          logger.warn('Error while fetching Conforma result from KubeArchive', {
            error: karchErr,
          });
        });
    } else if (taskRunUid && taskRunNs && pipelineRunUid) {
      const fetchLogs = async () => {
        try {
          const logs = await getTaskRunLog(taskRunNs, taskRunUid, pipelineRunUid);
          if (unmount) return;
          const json = extractConformaResultsFromTaskRunLogs(logs);
          setCrJson(json);
          setCrLoaded(true);
        } catch (e) {
          if (unmount) return;
          setCrLoaded(true);
          logger.warn('Error while fetching Conforma result from tekton results logs', {
            error: e,
          });
        }
      };
      void fetchLogs();
    }

    return () => {
      unmount = true;
    };
  }, [
    fetchArchive,
    crLoaded,
    isKubearchiveEnabled,
    crResultOpts,
    taskRunUid,
    taskRunNs,
    pipelineRunUid,
  ]);

  const conformaResult = React.useMemo(() => {
    // filter out components for which Conforma didn't execute because invalid image URL
    return crLoaded && crJson
      ? crJson.components?.filter((comp: ComponentConformaResult) => {
          return !(
            comp.violations &&
            comp.violations?.length === 1 &&
            !comp.violations[0].metadata &&
            comp.violations[0].msg.includes('404 Not Found')
          );
        })
      : undefined;
  }, [crJson, crLoaded]);

  const error = pipelineRunError ?? taskRunError;

  return [conformaResult, error ? true : crLoaded, error];
};

export const mapConformaResultData = (
  conformaResult: ComponentConformaResult[],
): UIConformaData[] => {
  return conformaResult.reduce((acc, compResult) => {
    compResult?.violations?.forEach((v) => {
      const rule: UIConformaData = {
        title: v.metadata?.title,
        description: v.metadata?.description,
        status: CONFORMA_RESULT_STATUS.violations,
        timestamp: v.metadata?.effective_on,
        component: compResult.name,
        containerImage: compResult.containerImage,
        msg: v.msg,
        collection: v.metadata?.collections,
        solution: v.metadata?.solution,
      };
      acc.push(rule);
    });
    compResult?.warnings?.forEach((v) => {
      const warningFields = computeWarningFields(
        v.metadata?.effective_on,
        v.metadata?.effective_until,
      );
      const rule: UIConformaData = {
        title: v.metadata?.title,
        description: v.metadata?.description,
        status: CONFORMA_RESULT_STATUS.warnings,
        timestamp: v.metadata?.effective_on,
        component: compResult.name,
        containerImage: compResult.containerImage,
        msg: v.msg,
        collection: v.metadata?.collections,
        solution: v.metadata?.solution,
        ...warningFields,
      };
      acc.push(rule);
    });
    compResult?.successes?.forEach((v) => {
      const rule: UIConformaData = {
        title: v.metadata?.title,
        description: v.metadata?.description,
        status: CONFORMA_RESULT_STATUS.successes,
        component: compResult.name,
        containerImage: compResult.containerImage,
        collection: v.metadata?.collections,
      };
      acc.push(rule);
    });

    return acc;
  }, []);
};

const USE_MOCK_DATA = true;

const mockConformaData: UIConformaData[] = [
  {
    title: 'CVE results found',
    description:
      'Verify that the build task results has the CVE scan results and no CVEs with critical severity are detected.',
    status: CONFORMA_RESULT_STATUS.successes,
    component: 'backend-api',
    containerImage: 'quay.io/redhat-appstudio/backend-api@sha256:abc123',
    collection: ['minimal', 'redhat'],
  },
  {
    title: 'Test data is accessible',
    description: 'Verify the test data is accessible and complete.',
    status: CONFORMA_RESULT_STATUS.successes,
    component: 'backend-api',
    containerImage: 'quay.io/redhat-appstudio/backend-api@sha256:abc123',
    collection: ['minimal'],
  },
  {
    title: 'Image signature check passed',
    description: 'Verify that the image has been signed using cosign.',
    status: CONFORMA_RESULT_STATUS.successes,
    component: 'backend-api',
    containerImage: 'quay.io/redhat-appstudio/backend-api@sha256:abc123',
    collection: ['minimal', 'redhat'],
  },
  {
    title: 'SLSA Provenance available',
    description: 'Verify the build has SLSA provenance attestation available.',
    status: CONFORMA_RESULT_STATUS.successes,
    component: 'backend-api',
    containerImage: 'quay.io/redhat-appstudio/backend-api@sha256:abc123',
    collection: ['slsa3'],
  },
  {
    title: 'CVE results threshold exception',
    description: 'Verify that CVE scan results do not exceed the critical threshold.',
    status: CONFORMA_RESULT_STATUS.warnings,
    timestamp: '2026-06-01T00:00:00Z',
    component: 'backend-api',
    containerImage: 'quay.io/redhat-appstudio/backend-api@sha256:abc123',
    msg: 'CVE scan results exceed the critical threshold but an exception is in place.',
    collection: ['redhat'],
    solution:
      'Fix all CVEs above the critical threshold before the exception expires, or request an extension.',
    effectiveUntil: '2026-08-04T00:00:00Z',
    daysUntilEvent: 15,
    warningType: 'expiring-exception' as const,
  },
  {
    title: 'SLSA v1.0 provenance format required',
    description: 'Verify that builds produce SLSA v1.0 provenance attestations.',
    status: CONFORMA_RESULT_STATUS.warnings,
    timestamp: '2026-07-30T00:00:00Z',
    component: 'backend-api',
    containerImage: 'quay.io/redhat-appstudio/backend-api@sha256:abc123',
    msg: 'New policy rule will require SLSA v1.0 provenance format.',
    collection: ['slsa3'],
    solution:
      'Update your build pipeline to produce SLSA v1.0 provenance attestations. See https://slsa.dev/spec/v1.0/ for details.',
    daysUntilEvent: 10,
    warningType: 'upcoming-activation' as const,
  },
  {
    title: 'Deprecated image registry',
    description: 'Verify that the image is not from a deprecated registry.',
    status: CONFORMA_RESULT_STATUS.warnings,
    timestamp: '2026-08-15T00:00:00Z',
    component: 'backend-api',
    containerImage: 'quay.io/redhat-appstudio/backend-api@sha256:abc123',
    msg: 'Image is from a registry that will be deprecated.',
    collection: ['redhat'],
    solution: 'Migrate the image to a supported registry.',
    effectiveUntil: '2026-08-15T00:00:00Z',
    daysUntilEvent: 26,
    warningType: 'expiring-exception' as const,
  },
  {
    title: 'Step image registries',
    description: 'Verify that all step images are from trusted registries.',
    status: CONFORMA_RESULT_STATUS.violations,
    component: 'backend-api',
    containerImage: 'quay.io/redhat-appstudio/backend-api@sha256:abc123',
    msg: 'Step 3 uses an image from an untrusted registry: docker.io/library/node:18.',
    collection: ['redhat'],
    solution: 'Use images from trusted registries such as registry.redhat.io or quay.io.',
  },
];

const findMockPipelineRun = (name: string): boolean => {
  for (const runs of Object.values(mockIntegrationTestPipelineRuns)) {
    if (runs.find((r) => r.metadata?.name === name)) return true;
  }
  return false;
};

export const useConformaResult = (
  pipelineRunName: string,
): [UIConformaData[], boolean, unknown] => {
  if (USE_MOCK_DATA && findMockPipelineRun(pipelineRunName)) {
    return [mockConformaData, true, undefined];
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- USE_MOCK_DATA is a build-time constant
  const [cr, crLoaded, crError] = useConformaResultFromLogs(pipelineRunName);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- USE_MOCK_DATA is a build-time constant
  const conformaResult = React.useMemo(() => {
    return crLoaded && cr && !crError ? mapConformaResultData(cr) : undefined;
  }, [cr, crLoaded, crError]);

  return [conformaResult, crLoaded, crError];
};
