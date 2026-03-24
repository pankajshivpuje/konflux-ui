import React from 'react';
import { FULL_APPLICATION_TITLE } from '../../../consts/labels';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useNamespace } from '../../../shared/providers/Namespace';
import { GroupFormPage } from './GroupFormPage';

const CreateGroupPage: React.FC<React.PropsWithChildren<unknown>> = () => {
  const namespace = useNamespace();

  useDocumentTitle(`Create group in namespace, ${namespace} | ${FULL_APPLICATION_TITLE}`);

  return <GroupFormPage />;
};

export default CreateGroupPage;
