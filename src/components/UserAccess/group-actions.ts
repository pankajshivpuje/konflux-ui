import { GROUP_EDIT_PAGE } from '@routes/paths';
import { RoleBindingModel } from '../../models';
import { Action } from '../../shared/components/action-menu/types';
import { useNamespace } from '../../shared/providers/Namespace';
import { useAccessReviewForModel } from '../../utils/rbac';
import { createRawModalLauncher } from '../modal/createModalLauncher';
import { useModalLauncher } from '../modal/ModalProvider';
import { DeleteGroupModal } from './DeleteGroupModal';
import { KonfluxGroup } from './group-utils';

const deleteGroupModalLauncher = (group: KonfluxGroup) =>
  createRawModalLauncher(DeleteGroupModal, {
    'data-test': 'delete-group-modal',
    title: 'Delete group?',
    titleIconVariant: 'warning',
  })({ group });

export const useGroupActions = (group: KonfluxGroup): Action[] => {
  const showModal = useModalLauncher();
  const namespace = useNamespace();
  const [canUpdateRB] = useAccessReviewForModel(RoleBindingModel, 'update');
  const [canDeleteRB] = useAccessReviewForModel(RoleBindingModel, 'delete');

  return [
    {
      label: 'Edit group',
      id: `edit-group-${group.name}`,
      disabled: !canUpdateRB,
      disabledTooltip: "You don't have permission to edit groups",
      cta: {
        href: GROUP_EDIT_PAGE.createPath({
          workspaceName: namespace,
          groupName: group.name,
        }),
      },
    },
    {
      cta: () => showModal(deleteGroupModalLauncher(group)),
      id: `delete-group-${group.name}`,
      label: 'Delete group',
      disabled: !canDeleteRB,
      disabledTooltip: "You don't have permission to delete groups",
    },
  ];
};
