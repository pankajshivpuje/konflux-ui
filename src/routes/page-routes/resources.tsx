import { RESOURCES_PATH } from '../paths';
import { RouteErrorBoundry } from '../RouteErrorBoundary';

const resourcesRoutes = [
  {
    path: RESOURCES_PATH.path,
    errorElement: <RouteErrorBoundry />,
    async lazy() {
      const { Resources } = await import(
        '../../components/Resources' /* webpackChunkName: "resources" */
      );
      return { element: <Resources /> };
    },
  },
];

export default resourcesRoutes;
