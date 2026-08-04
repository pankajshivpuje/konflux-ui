import * as React from 'react';
import { USE_MOCK_DATA, mockGitOpsRepos } from './__mock__/mock-data';

export type GitOpsRegistrationInfo = {
  isRegistered: boolean;
  repoUrl?: string;
  repoName?: string;
  registeredAt?: string;
  lastSynced?: string;
  status?: string;
};

export const useGitOpsRegistration = (
  namespace: string,
): [GitOpsRegistrationInfo, boolean, unknown] => {
  const [info, setInfo] = React.useState<GitOpsRegistrationInfo>({ isRegistered: false });
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!namespace) {
      setInfo({ isRegistered: false });
      setLoaded(true);
      return;
    }

    if (USE_MOCK_DATA) {
      const match = mockGitOpsRepos.find((r) => r.namespace === namespace);
      setInfo(
        match
          ? {
              isRegistered: true,
              repoUrl: match.repoUrl,
              repoName: match.name,
              registeredAt: match.registeredAt,
              lastSynced: match.lastSynced,
              status: match.status,
            }
          : { isRegistered: false },
      );
      setLoaded(true);
      return;
    }

    setInfo({ isRegistered: false });
    setLoaded(true);
  }, [namespace]);

  return [info, loaded, undefined];
};
