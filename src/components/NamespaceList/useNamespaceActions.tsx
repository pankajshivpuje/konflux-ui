import * as React from 'react';
import { GITOPS_EDIT_PATH, GITOPS_REGISTER_PATH } from '@routes/paths';
import { useGitOpsRegistration } from '~/hooks/useGitOpsRegistration';
import { RoleBindingModel } from '~/models';
import { Action } from '~/shared/components/action-menu/types';
import { NamespaceKind } from '~/types';
import { checkReviewAccesses } from '~/utils/rbac';
import { useModalLauncher } from '../modal/ModalProvider';
import { createManageVisibilityModalLauncher } from './ManageVisibilityModalLauncher';

export const useNamespaceActions = (
  namespace: NamespaceKind,
): [Action[], boolean, (isOpen: boolean) => void] => {
  const showModal = useModalLauncher();
  const [gitopsInfo] = useGitOpsRegistration(namespace.metadata.name);
  const [isChecking, setChecking] = React.useState(false);
  const [canManage, setCanManage] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [permissionError, setPermissionError] = React.useState<string | null>(null);

  const checkPermissions = React.useCallback(async () => {
    setChecking(true);
    setPermissionError(null);
    try {
      const hasPermission = await checkReviewAccesses(
        [
          { model: RoleBindingModel, verb: 'create' },
          { model: RoleBindingModel, verb: 'delete' },
        ],
        namespace.metadata.name,
      );
      setCanManage(hasPermission);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('SelfSubjectAccessReview failed:', e);
      setCanManage(false); // assume false on error for security
      setPermissionError(
        'Permission check failed. Please try again or contact your administrator.',
      );
    }
    setChecking(false);
    setChecked(true);
  }, [namespace.metadata.name]);

  const onToggle = React.useCallback(
    (isOpen: boolean) => {
      if (isOpen && !checked) {
        void checkPermissions();
      }
    },
    [checked, checkPermissions],
  );

  const gitopsAction: Action = React.useMemo(() => {
    if (gitopsInfo.isRegistered && gitopsInfo.repoName) {
      return {
        id: `edit-gitops-registration-${namespace.metadata.name.toLowerCase()}`,
        label: 'Edit GitOps Registration',
        cta: {
          href: GITOPS_EDIT_PATH.createPath({
            workspaceName: namespace.metadata.name,
            gitopsRepoName: gitopsInfo.repoName,
          }),
        },
      };
    }
    return {
      id: `register-gitops-repo-${namespace.metadata.name.toLowerCase()}`,
      label: 'Register GitOps Repo',
      cta: {
        href: GITOPS_REGISTER_PATH.createPath({
          workspaceName: namespace.metadata.name,
        }),
      },
    };
  }, [namespace.metadata.name, gitopsInfo.isRegistered, gitopsInfo.repoName]);

  const actions: Action[] = React.useMemo(
    () => [
      gitopsAction,
      {
        id: `manage-visibility-${namespace.metadata.name.toLowerCase()}`,
        label: 'Manage visibility',
        cta: () => {
          if (canManage) {
            showModal(createManageVisibilityModalLauncher(namespace));
          }
        },
        disabled: isChecking || (checked && !canManage),
        disabledTooltip: isChecking
          ? 'Checking permissions...'
          : permissionError || "You don't have permission to manage namespace visibility",
      },
    ],
    [namespace, gitopsAction, canManage, isChecking, checked, permissionError, showModal],
  );

  return [actions, isChecking, onToggle];
};
