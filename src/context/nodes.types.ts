import { SensorData } from '../services/googleSheetsService';

export type NodeData = SensorData;

export interface NodesContextType {
  nodes: NodeData[];
  loading: boolean;
  error: Error | null;
}
