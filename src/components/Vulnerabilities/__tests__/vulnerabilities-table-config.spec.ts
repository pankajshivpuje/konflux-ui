import { AppVulnerabilityRow, SEVERITY_META, cveUrl, getBaseColumns } from '../vulnerabilities-table-config';

const row = (over: Partial<AppVulnerabilityRow> = {}): AppVulnerabilityRow => ({
  cveId: 'CVE-1',
  severity: 'critical',
  packageName: 'openssl',
  packageVersion: '3.0.5',
  fixedInVersion: '3.0.7',
  imageDigest: 'sha256:a',
  pipelineRunName: 'plr',
  taskRunName: 'tr',
  ...over,
});

describe('vulnerabilities-table-config', () => {
  it('cveUrl points at the Red Hat CVE database', () => {
    expect(cveUrl('CVE-1')).toBe('https://access.redhat.com/security/cve/CVE-1');
  });

  it('severity sort orders most-severe first', () => {
    const cols = getBaseColumns(false);
    const severityCol = cols.find((c) => c.id === 'severity');
    expect(severityCol?.sortFn).toBeDefined();
    const cmp = severityCol.sortFn(
      { original: row({ severity: 'low' }) } as never,
      { original: row({ severity: 'critical' }) } as never,
      'severity',
    );
    expect(cmp).toBeGreaterThan(0); // low sorts after critical
  });

  it('includes an Image column only when showImage is true', () => {
    expect(getBaseColumns(false).some((c) => c.id === 'image')).toBe(false);
    expect(getBaseColumns(true).some((c) => c.id === 'image')).toBe(true);
  });

  it('SEVERITY_META covers every severity', () => {
    expect(Object.keys(SEVERITY_META)).toEqual([
      'critical',
      'important',
      'moderate',
      'low',
      'unknown',
    ]);
  });

  it('includes CVSS and Component source columns', () => {
    const ids = getBaseColumns(false).map((c) => c.id);
    expect(ids).toContain('cvssScore');
    expect(ids).toContain('componentSource');
  });

  it('CVSS sort orders higher scores after lower (ascending)', () => {
    const cvssCol = getBaseColumns(false).find((c) => c.id === 'cvssScore');
    expect(cvssCol?.sortFn).toBeDefined();
    const cmp = cvssCol.sortFn(
      { original: row({ cvssScore: 3.1 }) } as never,
      { original: row({ cvssScore: 9.8 }) } as never,
      'cvssScore',
    );
    expect(cmp).toBeLessThan(0);
  });
});
