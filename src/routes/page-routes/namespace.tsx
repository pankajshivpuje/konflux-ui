import { FilterContextProvider } from '~/components/Filter/generic/FilterContext';
import { NAMESPACE_LIST_PATH } from '../paths';
import { RouteErrorBoundry } from '../RouteErrorBoundary';

const workspaceRoutes = [
  {
    path: NAMESPACE_LIST_PATH.path,
    errorElement: <RouteErrorBoundry />,
    async lazy() {
      const { NamespaceListView } = await import(
        '../../components/NamespaceList' /* webpackChunkName: "namespace-list" */
      );
      return {
        element: (
          <FilterContextProvider filterParams={['name']}>
            <NamespaceListView />{' '}
          </FilterContextProvider>
        ),
      };
    },
  },
];

export default workspaceRoutes;
