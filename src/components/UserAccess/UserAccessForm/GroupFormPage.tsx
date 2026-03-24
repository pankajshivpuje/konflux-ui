import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { Formik, FormikHelpers } from 'formik';
import { USER_ACCESS_LIST_PAGE } from '@routes/paths';
import { getErrorState } from '~/shared/utils/error-utils';
import { USE_MOCK_DATA } from '../../../hooks/__mock__/mock-data';
import { useRoleMap } from '../../../hooks/useRole';
import { useNamespace } from '../../../shared/providers/Namespace';
import { NamespaceRole, RoleBinding } from '../../../types';
import { TrackEvents, useTrackEvent } from '../../../utils/analytics';
import {
  createGroupRBs,
  deleteGroup,
  groupFormSchema,
  GroupFormValues,
} from './form-utils';
import { GroupForm } from './GroupForm';

type Props = {
  existingGroupName?: string;
  existingRBs?: RoleBinding[];
  edit?: boolean;
};

export const GroupFormPage: React.FC<React.PropsWithChildren<Props>> = ({
  existingGroupName,
  existingRBs,
  edit,
}) => {
  const namespace = useNamespace();
  const [roleMap, loaded, error] = useRoleMap();
  const track = useTrackEvent();
  const navigate = useNavigate();

  const handleSubmit = async (
    values: GroupFormValues,
    actions: FormikHelpers<GroupFormValues>,
  ) => {
    track(TrackEvents.ButtonClicked, {
      link_name: edit ? 'edit-group-submit' : 'create-group-submit',
      namespace,
    });
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else if (edit && existingRBs) {
        // Delete old, create new
        await deleteGroup(existingRBs, true);
        await createGroupRBs(values, namespace, true);
        await deleteGroup(existingRBs);
        await createGroupRBs(values, namespace);
      } else {
        await createGroupRBs(values, namespace, true);
        await createGroupRBs(values, namespace);
      }
      track(edit ? 'Group Edited' : 'Group Created', {
        groupName: values.groupName,
        namespace,
      });
      navigate(USER_ACCESS_LIST_PAGE.createPath({ workspaceName: namespace }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Failed to submit. Please try again.';
      actions.setStatus({ submitError: message });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleReset = () => {
    track(TrackEvents.ButtonClicked, {
      link_name: edit ? 'edit-group-leave' : 'create-group-leave',
      namespace,
    });
    navigate(USER_ACCESS_LIST_PAGE.createPath({ workspaceName: namespace }));
  };

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner data-test="spinner" />
      </Bullseye>
    );
  }
  if (error) {
    return getErrorState(error, loaded, 'roles');
  }

  const existingRole = existingRBs?.[0]?.roleRef?.name;

  const initialValues: GroupFormValues = {
    groupName: existingGroupName ?? '',
    usernames: existingRBs
      ? existingRBs.flatMap(
          (rb) => rb.subjects?.filter((s) => s.kind === 'User').map((s) => s.name) ?? [],
        )
      : [],
    role: (existingRole ? roleMap?.roleMap[existingRole] : undefined) as NamespaceRole,
    roleMap,
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      onReset={handleReset}
      initialValues={initialValues}
      validationSchema={groupFormSchema}
    >
      {(props) => <GroupForm {...props} edit={edit} />}
    </Formik>
  );
};
