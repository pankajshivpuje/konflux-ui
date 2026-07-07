import { FilterContextProvider } from '~/components/Filter/generic/FilterContext';
import { importPageLoader, ImportForm } from '../../components/ImportForm';
import { IMPORT_PATH, NAMESPACE_LIST_PATH, WORKSPACE_PATH } from '../paths';
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
  {
    path: IMPORT_PATH.path,
    loader: importPageLoader,
    errorElement: <RouteErrorBoundry />,
    element: <ImportForm />,
  },
  {
    path: WORKSPACE_PATH.path,
    errorElement: <RouteErrorBoundry />,
    async lazy() {
      const { default: NamespaceDetails } = await import(
        '../../components/NamespaceDetails/NamespaceDetails' /* webpackChunkName: "namespace-details" */
      );
      return { element: <NamespaceDetails /> };
    },
    children: [
      {
        index: true,
        async lazy() {
          const { default: NamespaceOverviewTab } = await import(
            '../../components/NamespaceDetails/NamespaceOverviewTab' /* webpackChunkName: "namespace-overview-tab" */
          );
          return { element: <NamespaceOverviewTab /> };
        },
      },
      {
        path: 'details',
        async lazy() {
          const { default: NamespaceDetailsTab } = await import(
            '../../components/NamespaceDetails/NamespaceDetailsTab' /* webpackChunkName: "namespace-details-tab" */
          );
          return { element: <NamespaceDetailsTab /> };
        },
      },
    ],
  },
];

export default workspaceRoutes;
