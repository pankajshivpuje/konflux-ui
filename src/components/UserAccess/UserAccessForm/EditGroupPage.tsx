import React from 'react';
import { useParams } from 'react-router-dom';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { FULL_APPLICATION_TITLE } from '../../../consts/labels';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRoleBindings } from '../../../hooks/useRoleBindings';
import { RoleBindingModel } from '../../../models';
import { RouterParams } from '../../../routes/utils';
import { useNamespace } from '../../../shared/providers/Namespace';
import { AccessReviewResources } from '../../../types';
import { getGroupName } from '../group-utils';
import PageAccessCheck from '../../PageAccess/PageAccessCheck';
import { GroupFormPage } from './GroupFormPage';

const EditGroupPage: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { groupName } = useParams<RouterParams>();
  const namespace = useNamespace();
  const [allRoleBindings, loaded] = useRoleBindings(namespace);

  useDocumentTitle(`Edit group ${groupName} | ${FULL_APPLICATION_TITLE}`);

  const groupRBs = React.useMemo(
    () => allRoleBindings.filter((rb) => getGroupName(rb) === groupName),
    [allRoleBindings, groupName],
  );

  const accessReviewResources: AccessReviewResources = [
    { model: RoleBindingModel, verb: 'update' },
  ];

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner data-test="spinner" />
      </Bullseye>
    );
  }

  return (
    <PageAccessCheck accessReviewResources={accessReviewResources}>
      <GroupFormPage existingGroupName={groupName} existingRBs={groupRBs} edit />
    </PageAccessCheck>
  );
};

export default EditGroupPage;
