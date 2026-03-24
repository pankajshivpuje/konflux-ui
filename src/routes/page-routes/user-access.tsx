import {
  GROUP_CREATE_PAGE,
  GROUP_EDIT_PAGE,
  USER_ACCESS_EDIT_PAGE,
  USER_ACCESS_GRANT_PAGE,
  USER_ACCESS_LIST_PAGE,
} from '@routes/paths';
import {
  GrantAccessPage,
  grantAccessPageLoader,
  EditAccessPage,
  UserAccessListPage,
  userAccessListPageLoader,
  CreateGroupPage,
  EditGroupPage,
} from '~/components/UserAccess';
import { RouteErrorBoundry } from '../RouteErrorBoundary';

const userAccessRoutes = [
  {
    path: USER_ACCESS_GRANT_PAGE.path,
    loader: grantAccessPageLoader,
    element: <GrantAccessPage />,
    errorElement: <RouteErrorBoundry />,
  },
  {
    path: USER_ACCESS_EDIT_PAGE.path,
    element: <EditAccessPage />,
    errorElement: <RouteErrorBoundry />,
  },
  {
    path: GROUP_CREATE_PAGE.path,
    loader: grantAccessPageLoader,
    element: <CreateGroupPage />,
    errorElement: <RouteErrorBoundry />,
  },
  {
    path: GROUP_EDIT_PAGE.path,
    element: <EditGroupPage />,
    errorElement: <RouteErrorBoundry />,
  },
  {
    path: USER_ACCESS_LIST_PAGE.path,
    element: <UserAccessListPage />,
    errorElement: <RouteErrorBoundry />,
    loader: userAccessListPageLoader,
  },
];

export default userAccessRoutes;
