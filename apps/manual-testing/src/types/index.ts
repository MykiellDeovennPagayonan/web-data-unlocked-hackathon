export interface Flow {
  id: string;
  title: string;
  description: string;
  category: 'core' | 'secondary' | 'setup';
  steps: FlowStep[];
}

export interface FlowStep {
  id: string;
  number: number;
  title: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  headers: Record<string, string>;
  body: object | null;
  variablesUsed: string[];
  variablesCreated: string[];
  expectedOutput?: object;
  description?: string;
}

export interface VariableStore {
  [key: string]: string;
}

export interface RequestState {
  isLoading: boolean;
  response: unknown | null;
  error: string | null;
  executedAt: Date | null;
  statusCode?: number;
}

export interface ApiRequest {
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body: object | null;
}
