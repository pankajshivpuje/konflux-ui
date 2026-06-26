import { GITOPS_EDIT_PATH, GITOPS_REGISTER_PATH } from '../paths';
import { RouteErrorBoundry } from '../RouteErrorBoundary';

const gitopsRoutes = [
  {
    path: GITOPS_REGISTER_PATH.path,
    errorElement: <RouteErrorBoundry />,
    async lazy() {
      const { GitOpsRegistrationForm } = await import(
        '../../components/GitOpsRegistration' /* webpackChunkName: "gitops-registration-form" */
      );
      return { element: <GitOpsRegistrationForm /> };
    },
  },
  {
    path: GITOPS_EDIT_PATH.path,
    errorElement: <RouteErrorBoundry />,
    async lazy() {
      const { GitOpsRegistrationForm } = await import(
        '../../components/GitOpsRegistration' /* webpackChunkName: "gitops-registration-form" */
      );
      return { element: <GitOpsRegistrationForm /> };
    },
  },
];

export default gitopsRoutes;
