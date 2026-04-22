import { UIConformaData } from '~/types/conforma';
import { getRemediationGuidance, getWarningMessage } from '~/utils/ecp-warning-utils';
import { Issue, IssueSeverity, IssueState, IssueType } from './issue-type';

export const convertWarningsToIssues = (
  warnings: UIConformaData[],
  namespace: string,
): Issue[] => {
  return warnings.map((warning, index) => {
    const now = new Date().toISOString();
    const severity =
      warning.warningType === 'expiring-exception' ? IssueSeverity.MAJOR : IssueSeverity.INFO;

    return {
      id: `policy-warning-${index}`,
      title: getWarningMessage(warning),
      description: `${warning.description}\n\nRemediation: ${getRemediationGuidance(warning)}`,
      severity,
      issueType: IssueType.POLICY,
      state: IssueState.ACTIVE,
      detectedAt: now,
      namespace,
      scope: {
        resourceType: 'policy',
        resourceName: warning.title,
        resourceNamespace: namespace,
      },
      links: warning.collection?.length
        ? [
            {
              id: `policy-link-${index}`,
              title: `Collection: ${warning.collection.join(', ')}`,
              url: 'https://redhat-appstudio.github.io/docs.stonesoup.io/ec-policies/release_policy.html#_available_rule_collections',
              issueId: `policy-warning-${index}`,
            },
          ]
        : [],
      relatedFrom: [],
      relatedTo: [],
      createdAt: now,
      updatedAt: now,
    };
  });
};
