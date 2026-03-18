import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@patternfly/react-core';
import { useApplications } from '../../../hooks/useApplications';
import {
  APPLICATION_DETAILS_PATH,
  APPLICATION_LIST_PATH,
} from '../../../routes/paths';
import { ContextMenuItem, ContextSwitcher } from '../../../shared/components';
import { useNamespace } from '../../../shared/providers/Namespace';

export const ApplicationSwitcher: React.FC<
  React.PropsWithChildren<{ selectedApplication?: string }>
> = ({ selectedApplication }) => {
  const navigate = useNavigate();
  const namespace = useNamespace();

  const [applications] = useApplications(namespace);

  const menuItems = React.useMemo(
    () =>
      applications?.map((app) => ({ key: app.metadata.name, name: app.spec.displayName })) || [],
    [applications],
  );

  const selectedItem = menuItems.find((item) => item.key === selectedApplication);

  const onSelect = (item: ContextMenuItem) => {
    selectedItem.key !== item.key &&
      navigate(
        APPLICATION_DETAILS_PATH.createPath({
          workspaceName: namespace,
          applicationName: item.key,
        }),
      );
  };

  return menuItems.length > 1 ? (
    <ContextSwitcher
      resourceType="application"
      menuItems={menuItems}
      selectedItem={selectedItem}
      onSelect={onSelect}
      footer={
        <Button
          variant="link"
          component={(props) => (
            <Link
              {...props}
              to={APPLICATION_LIST_PATH.createPath({ workspaceName: namespace })}
            />
          )}
          isInline
        >
          View applications list
        </Button>
      }
    />
  ) : null;
};
