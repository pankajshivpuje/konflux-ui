import React from 'react';
import { Form, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { FormikProps, useFormikContext } from 'formik';
import isEmpty from 'lodash/isEmpty';
import PageLayout from '../../../components/PageLayout/PageLayout';
import { FormFooter } from '../../../shared';
import { useNamespace } from '../../../shared/providers/Namespace';
import { GroupFormValues } from './form-utils';
import { GroupNameSection } from './GroupNameSection';
import { RoleSection } from './RoleSection';
import { UsernameSection } from './UsernameSection';

type Props = FormikProps<GroupFormValues> & {
  edit?: boolean;
};

export const GroupForm: React.FC<React.PropsWithChildren<Props>> = ({
  edit,
  isSubmitting,
  dirty,
  errors,
  status,
  handleSubmit,
  handleReset,
}) => {
  const namespace = useNamespace();
  const { values } = useFormikContext<GroupFormValues>();

  const customErrors =
    errors?.usernames === '' && values?.usernames.length > 0 ? undefined : errors;

  return (
    <PageLayout
      title={edit ? `Edit group` : `Create group in namespace, ${namespace}`}
      description={
        edit
          ? 'Update the group members or role.'
          : 'Create a group to manage access for multiple users at once.'
      }
      footer={
        <FormFooter
          submitLabel={edit ? 'Save changes' : 'Create group'}
          handleCancel={handleReset}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disableSubmit={!dirty || !isEmpty(customErrors) || isSubmitting}
          errorMessage={status?.submitError}
        />
      }
    >
      <PageSection isFilled variant={PageSectionVariants.light}>
        <Form onSubmit={handleSubmit}>
          <GroupNameSection disabled={edit} />
          <UsernameSection />
          <RoleSection />
        </Form>
      </PageSection>
    </PageLayout>
  );
};
