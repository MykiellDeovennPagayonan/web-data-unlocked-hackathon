import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoredResponse {
  response: unknown | null;
  error: string | null;
  statusCode?: number;
  executedAt: string;
}

interface ProgressState {
  variables: Record<string, string>;
  bodies: Record<string, string>;
  responses: Record<string, StoredResponse>;

  setVariable: (name: string, value: string) => void;
  setVariables: (newVars: Record<string, string>) => void;
  getVariable: (name: string) => string | undefined;
  clearVariables: () => void;
  clearVariable: (name: string) => void;

  setBody: (stepId: string, body: string) => void;
  clearBody: (stepId: string) => void;

  setResponse: (stepId: string, response: StoredResponse) => void;
  clearResponse: (stepId: string) => void;

  clearAll: () => void;
}

export const useVariables = create<ProgressState>()(
  persist(
    (set, get) => ({
      variables: {},
      bodies: {},
      responses: {},

      setVariable: (name, value) => {
        set((state) => ({
          variables: { ...state.variables, [name]: value }
        }));
      },
      setVariables: (newVars) => {
        set((state) => ({
          variables: { ...state.variables, ...newVars }
        }));
      },
      getVariable: (name) => {
        return get().variables[name];
      },
      clearVariables: () => {
        set({ variables: {} });
      },
      clearVariable: (name) => {
        set((state) => {
          const newVars = { ...state.variables };
          delete newVars[name];
          return { variables: newVars };
        });
      },

      setBody: (stepId, body) => {
        set((state) => ({
          bodies: { ...state.bodies, [stepId]: body }
        }));
      },
      clearBody: (stepId) => {
        set((state) => {
          const newBodies = { ...state.bodies };
          delete newBodies[stepId];
          return { bodies: newBodies };
        });
      },

      setResponse: (stepId, response) => {
        set((state) => ({
          responses: { ...state.responses, [stepId]: response }
        }));
      },
      clearResponse: (stepId) => {
        set((state) => {
          const newResponses = { ...state.responses };
          delete newResponses[stepId];
          return { responses: newResponses };
        });
      },

      clearAll: () => {
        set({ variables: {}, bodies: {}, responses: {} });
      },
    }),
    {
      name: 'trustlayer-manual-testing-progress',
    }
  )
);
