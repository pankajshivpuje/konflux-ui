import { useParams } from 'react-router-dom';
import { FilterContextProvider } from '~/components/Filter/generic/FilterContext';
import { USE_MOCK_DATA } from '../../../hooks/__mock__/mock-data';
import { K8sQueryListResourceItems } from '../../../k8s';
import { ComponentModel } from '../../../models';
import { RouterParams } from '../../../routes/utils';
import { createLoaderWithAccessCheck } from '../../../utils/rbac';
import { default as ComponentListView } from './ComponentListView';

const componentPageLoader = async ({ params }) => {
  if (USE_MOCK_DATA) {
    return [];
  }
  const ns = params[RouterParams.workspaceName];
  return K8sQueryListResourceItems({
    model: ComponentModel,
    queryOptions: { ns },
  });
};

export const componentsTabLoader = USE_MOCK_DATA
  ? componentPageLoader
  : createLoaderWithAccessCheck(componentPageLoader, { model: ComponentModel, verb: 'list' });

export const ComponentListTab: React.FC = () => {
  const { applicationName } = useParams<RouterParams>();
  return (
    <FilterContextProvider filterParams={['name', 'status']}>
      <ComponentListView applicationName={applicationName} />
    </FilterContextProvider>
  );
};
