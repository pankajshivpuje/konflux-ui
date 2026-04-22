import { GitOpsRepo } from '~/components/GitOpsRegistration/GitOpsRegistrationPage';
import { USE_MOCK_DATA, mockGitOpsRepos } from './__mock__/mock-data';

export interface GitOpsRegistrationInfo {
  isRegistered: boolean;
  repoName?: string;
  repoUrl?: string;
  registeredAt?: string;
  lastSynced?: string;
}

export const useGitOpsRegistration = (
  namespaceName: string,
): [GitOpsRegistrationInfo, boolean, unknown] => {
  if (USE_MOCK_DATA) {
    const match = mockGitOpsRepos.find(
      (r: GitOpsRepo) => r.namespace === namespaceName,
    );
    const info: GitOpsRegistrationInfo = match
      ? {
          isRegistered: true,
          repoName: match.name,
          repoUrl: match.repoUrl,
          registeredAt: match.registeredAt,
          lastSynced: match.lastSynced,
        }
      : { isRegistered: false };
    return [info, true, undefined];
  }

  // TODO: Replace with real API call to GitOps Registration Service
  return [{ isRegistered: false }, true, undefined];
};
