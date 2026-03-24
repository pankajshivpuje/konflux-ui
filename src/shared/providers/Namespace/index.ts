import { LoaderFunction } from 'react-router-dom';

export const namespaceLoader: LoaderFunction = async () => {
  return { data: [] };
};

export { NamespaceProvider } from './namespace-context';
export * from './useNamespaceInfo';
