import { runStatus } from '~/consts/pipelinerun';
import { TaskRunKind } from '~/types';
import {
  CVE_SCAN_REPORT,
  getScanStatus,
  getScanTaskRuns,
  hasVulnerabilityReport,
  normalizeSeverity,
  parseVulnerabilityReport,
} from '../scan-utils';

const trWithReport = (name: string, value: string, extra: Partial<TaskRunKind> = {}): TaskRunKind =>
  ({
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: { name },
    status: {
      conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded' }],
      results: [{ name: CVE_SCAN_REPORT, value }],
    },
    ...extra,
  }) as TaskRunKind;

const validReport = JSON.stringify({
  images: [
    {
      digest: 'sha256:aaa',
      pullSpec: 'quay.io/app:amd64',
      platform: 'linux/amd64',
      vulnerabilities: [
        { cveId: 'CVE-1', severity: 'critical', packageName: 'openssl', packageVersion: '3.0.5', fixedInVersion: '3.0.7' },
      ],
    },
    {
      digest: 'sha256:bbb',
      platform: 'linux/arm64',
      vulnerabilities: [],
    },
  ],
});

describe('normalizeSeverity', () => {
  it('passes through valid severities unchanged', () => {
    expect(normalizeSeverity('critical')).toBe('critical');
    expect(normalizeSeverity('important')).toBe('important');
    expect(normalizeSeverity('moderate')).toBe('moderate');
    expect(normalizeSeverity('low')).toBe('low');
    expect(normalizeSeverity('unknown')).toBe('unknown');
  });

  it('maps out-of-vocabulary strings to unknown', () => {
    expect(normalizeSeverity('high')).toBe('unknown');
    expect(normalizeSeverity('medium')).toBe('unknown');
    expect(normalizeSeverity('CRITICAL')).toBe('unknown');
    expect(normalizeSeverity('')).toBe('unknown');
  });

  it('maps non-string values to unknown', () => {
    expect(normalizeSeverity(null)).toBe('unknown');
    expect(normalizeSeverity(undefined)).toBe('unknown');
    expect(normalizeSeverity(42)).toBe('unknown');
  });
});

describe('parseVulnerabilityReport', () => {
  it('parses a valid multi-image report', () => {
    const report = parseVulnerabilityReport(validReport);
    expect(report.images).toHaveLength(2);
    expect(report.images[0].vulnerabilities[0].cveId).toBe('CVE-1');
  });

  it('preserves a valid severity unchanged', () => {
    const report = parseVulnerabilityReport(validReport);
    expect(report.images[0].vulnerabilities[0].severity).toBe('critical');
  });

  it('normalizes an out-of-vocabulary severity to unknown', () => {
    const raw = JSON.stringify({
      images: [
        {
          digest: 'sha256:ccc',
          vulnerabilities: [
            { cveId: 'CVE-999', severity: 'high', packageName: 'curl', packageVersion: '7.0.0' },
          ],
        },
      ],
    });
    const report = parseVulnerabilityReport(raw);
    expect(report.images[0].vulnerabilities[0].severity).toBe('unknown');
  });

  it('coerces a non-array vulnerabilities field to []', () => {
    const raw = JSON.stringify({
      images: [{ digest: 'sha256:ddd', vulnerabilities: null }],
    });
    const report = parseVulnerabilityReport(raw);
    expect(report.images[0].vulnerabilities).toEqual([]);
  });

  it('returns empty images on malformed JSON', () => {
    expect(parseVulnerabilityReport('{not json')).toEqual({ images: [] });
  });

  it('returns empty images on undefined', () => {
    expect(parseVulnerabilityReport(undefined)).toEqual({ images: [] });
  });

  it('coerces a missing images array to []', () => {
    expect(parseVulnerabilityReport('{}')).toEqual({ images: [] });
  });

  it('preserves the extended roxctl fields', () => {
    const raw = JSON.stringify({
      images: [
        {
          digest: 'sha256:eee',
          vulnerabilities: [
            {
              cveId: 'CVE-2024-0001',
              severity: 'important',
              packageName: 'openssl',
              packageVersion: '3.0.5',
              fixedInVersion: '3.0.7',
              description: 'A buffer overflow in the parser.',
              componentSource: 'OS',
              link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-0001',
              advisory: 'RHSA-2024:0123',
              advisoryLink: 'https://access.redhat.com/errata/RHSA-2024:0123',
            },
          ],
        },
      ],
    });
    const v = parseVulnerabilityReport(raw).images[0].vulnerabilities[0];
    expect(v).toMatchObject({
      description: 'A buffer overflow in the parser.',
      componentSource: 'OS',
      link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-0001',
      advisory: 'RHSA-2024:0123',
      advisoryLink: 'https://access.redhat.com/errata/RHSA-2024:0123',
    });
  });
});

describe('hasVulnerabilityReport', () => {
  it('is true when the CVE_SCAN_REPORT result is present', () => {
    expect(hasVulnerabilityReport(trWithReport('a', validReport))).toBe(true);
  });
  it('is false when absent', () => {
    expect(
      hasVulnerabilityReport({ metadata: { name: 'x' }, status: { results: [] } } as TaskRunKind),
    ).toBe(false);
  });
});

describe('getScanTaskRuns', () => {
  it('returns only TaskRuns carrying a CVE_SCAN_REPORT result', () => {
    const scan = trWithReport('scan', validReport);
    const other = { metadata: { name: 'build' }, status: { results: [] } } as TaskRunKind;
    expect(getScanTaskRuns([scan, other])).toEqual([scan]);
  });
  it('returns [] for none', () => {
    expect(getScanTaskRuns([])).toEqual([]);
  });
});

describe('getScanStatus', () => {
  it('is not-scanned when taskRun is undefined', () => {
    expect(getScanStatus(undefined)).toBe('not-scanned');
  });
  it('is running for a running scan', () => {
    const tr = {
      metadata: { name: 'r' },
      status: { conditions: [{ type: 'Succeeded', status: 'Unknown', reason: 'Running' }] },
    } as TaskRunKind;
    expect(getScanStatus(tr)).toBe('running');
  });
  it('is failed for a failed scan', () => {
    const tr = {
      metadata: { name: 'f' },
      status: { conditions: [{ type: 'Succeeded', status: 'False', reason: 'Failed' }] },
    } as TaskRunKind;
    expect(getScanStatus(tr)).toBe('failed');
  });
  it('is complete for a succeeded scan', () => {
    expect(getScanStatus(trWithReport('s', validReport))).toBe('complete');
  });
});

// runStatus import kept referenced so lint does not flag it as unused in future edits.
it('runStatus enum is accessible', () => {
  expect(runStatus.Running).toBeDefined();
});
