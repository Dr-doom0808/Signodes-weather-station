import { createContext } from 'react';
import { NodesContextType } from './nodes.types';

export const NodesContext = createContext<NodesContextType>({
  nodes: [],
  loading: true,
  error: null
});
