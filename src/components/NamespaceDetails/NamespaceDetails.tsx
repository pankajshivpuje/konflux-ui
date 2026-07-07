import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { NAMESPACE_LIST_PATH, WORKSPACE_PATH } from '@routes/paths';
import { useNamespaceInfo } from '~/shared/providers/Namespace';
import { NamespaceKind } from '~/types';
import DetailsPage from '../DetailsPage/DetailsPage';
import { Action as DetailsPageAction } from '../DetailsPage/types';
import { useNamespaceActions } from '../NamespaceList/useNamespaceActions';

const NamespaceDetails: React.FC = () => {
  const { workspaceName } = useParams<{ workspaceName: string }>();
  const { namespaces, namespacesLoaded } = useNamespaceInfo();

  const namespaceResource = React.useMemo(
    () =>
      namespaces?.find((ns) => ns.metadata?.name === workspaceName),
    [namespaces, workspaceName],
  );

  const [menuActions] = useNamespaceActions(
    namespaceResource ?? ({ metadata: { name: workspaceName } } as NamespaceKind),
  );

  const detailsPageActions: DetailsPageAction[] = React.useMemo(
    () =>
      menuActions.map((action) => {
        const base: DetailsPageAction = {
          key: action.id,
          label: action.label,
          isDisabled: action.disabled,
          disabledTooltip: action.disabledTooltip,
        };
        if (typeof action.cta === 'function') {
          return { ...base, onClick: action.cta };
        }
        if (typeof action.cta === 'object' && 'href' in action.cta) {
          return {
            ...base,
            component: <Link to={action.cta.href}>{action.label}</Link>,
          };
        }
        return base;
      }),
    [menuActions],
  );

  if (!namespacesLoaded) {
    return (
      <Bullseye>
        <Spinner data-test="spinner" />
      </Bullseye>
    );
  }

  const breadcrumbs = [
    { name: 'Namespaces', path: NAMESPACE_LIST_PATH.path },
    { name: workspaceName, path: WORKSPACE_PATH.createPath({ workspaceName }) },
  ];

  return (
    <DetailsPage
      data-test="namespace-details-test-id"
      headTitle={workspaceName}
      breadcrumbs={breadcrumbs}
      title={workspaceName}
      baseURL={WORKSPACE_PATH.createPath({ workspaceName })}
      actions={detailsPageActions}
      tabs={[
        {
          key: 'index',
          label: 'Overview',
          isFilled: true,
        },
        {
          key: 'details',
          label: 'Details',
          isFilled: true,
        },
      ]}
    />
  );
};

export default NamespaceDetails;
