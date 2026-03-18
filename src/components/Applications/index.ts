import { LoaderFunction } from 'react-router-dom';
import { USE_MOCK_DATA } from '../../hooks/__mock__/mock-data';
import { K8sQueryListResourceItems } from '../../k8s';
import { ApplicationModel } from '../../models';
import { createLoaderWithAccessCheck } from '../../utils/rbac';

const applicationPage: LoaderFunction = async ({ params }) => {
  if (USE_MOCK_DATA) {
    return [];
  }
  return await K8sQueryListResourceItems({
    model: ApplicationModel,
    queryOptions: { ns: params.workspaceName },
  });
};

export const applicationPageLoader = USE_MOCK_DATA
  ? applicationPage
  : createLoaderWithAccessCheck(applicationPage, {
      model: ApplicationModel,
      verb: 'list',
    });

export { default as ApplicationListView } from './ApplicationListView';
