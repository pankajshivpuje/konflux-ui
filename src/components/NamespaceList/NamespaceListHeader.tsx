import React from 'react';
import { ThProps } from '@patternfly/react-table';

export const namespaceTableColumnClasses = {
  name: 'pf-m-width-20',
  visibility: 'pf-m-width-10',
  applications: 'pf-m-width-10',
  gitopsRegistration: 'pf-m-width-10',
  gitopsRepoUrl: 'pf-m-width-15',
  registrationDate: 'pf-m-width-10',
  lastSynced: 'pf-m-width-10',
  kebab: 'pf-m-width-10 pf-c-table__action',
};

export const createNamespaceListHeader = () => {
  return () => {
    const columns: Array<{ title: string | React.ReactNode; props: ThProps }> = [
      {
        title: 'Name',
        props: { className: namespaceTableColumnClasses.name },
      },
      {
        title: 'Visibility',
        props: { className: namespaceTableColumnClasses.visibility },
      },
      {
        title: 'Applications',
        props: { className: namespaceTableColumnClasses.applications },
      },
      {
        title: 'GitOps Registration',
        props: { className: namespaceTableColumnClasses.gitopsRegistration },
      },
      {
        title: 'GitOps Repo URL',
        props: { className: namespaceTableColumnClasses.gitopsRepoUrl },
      },
      {
        title: 'Registration Date',
        props: { className: namespaceTableColumnClasses.registrationDate },
      },
      {
        title: 'Last Synced',
        props: { className: namespaceTableColumnClasses.lastSynced },
      },
    ];

    return columns;
  };
};

export const NamespaceListHeader = createNamespaceListHeader();
