export type GitOpsRegistrationInfo = {
  isRegistered: boolean;
  repoUrl?: string;
  registeredAt?: string;
  lastSynced?: string;
};

const defaultInfo: GitOpsRegistrationInfo = {
  isRegistered: false,
};

export const useGitOpsRegistration = (
  _namespace: string,
): [GitOpsRegistrationInfo, boolean, unknown] => {
  return [defaultInfo, true, undefined];
};
