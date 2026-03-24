import React from 'react';
import {
  Divider,
  PageSection,
  PageSectionVariants,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { GROUP_CREATE_PAGE, USER_ACCESS_GRANT_PAGE } from '@routes/paths';
import { FULL_APPLICATION_TITLE } from '../../consts/labels';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { RoleBindingModel } from '../../models';
import { useNamespace } from '../../shared/providers/Namespace';
import { useAccessReviewForModel } from '../../utils/rbac';
import { FilterContextProvider } from '../Filter/generic/FilterContext';
import PageLayout from '../PageLayout/PageLayout';
import { GroupListView } from './GroupListView';
import { UserAccessListView } from './UserAccessListView';

const UserAccessPage: React.FunctionComponent = () => {
  const namespace = useNamespace();
  const [activeTab, setActiveTab] = React.useState<string>('users');

  const [canCreateRB] = useAccessReviewForModel(RoleBindingModel, 'create');

  useDocumentTitle(`User access | ${FULL_APPLICATION_TITLE}`);

  const grantHref =
    activeTab === 'groups'
      ? GROUP_CREATE_PAGE.createPath({ workspaceName: namespace })
      : USER_ACCESS_GRANT_PAGE.createPath({ workspaceName: namespace });

  const grantLabel = activeTab === 'groups' ? 'Create group' : 'Grant access';

  return (
    <PageLayout
      title="User access"
      description="Manage access to your namespace for individual users and groups."
      actions={[
        {
          id: 'grant-access',
          label: grantLabel,
          disabled: !canCreateRB,
          disabledTooltip: 'You cannot grant access in this namespace',
          cta: {
            href: grantHref,
          },
        },
      ]}
    >
      <Divider style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }} />
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Tabs
          activeKey={activeTab}
          onSelect={(_e, key) => setActiveTab(key as string)}
          data-test="user-access-tabs"
        >
          <Tab eventKey="users" title={<TabTitleText>Users</TabTitleText>}>
            <FilterContextProvider filterParams={['username', 'rolebinding']}>
              <UserAccessListView />
            </FilterContextProvider>
          </Tab>
          <Tab eventKey="groups" title={<TabTitleText>Groups</TabTitleText>}>
            <FilterContextProvider filterParams={['groupname']}>
              <GroupListView />
            </FilterContextProvider>
          </Tab>
        </Tabs>
      </PageSection>
    </PageLayout>
  );
};

export default UserAccessPage;
