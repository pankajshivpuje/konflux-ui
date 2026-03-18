import { LoaderFunction } from 'react-router-dom';
import { queryNamespaces } from './utils';

export const namespaceLoader: LoaderFunction = async () => {
  return { data: [] };
};

export { NamespaceProvider } from './namespace-context';
export * from './useNamespaceInfo';
