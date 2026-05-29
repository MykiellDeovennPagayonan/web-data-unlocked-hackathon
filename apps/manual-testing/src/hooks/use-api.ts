import { useState, useCallback } from 'react';
import { executeRequest, generateCurlCommand } from '@/lib/api';
import { useVariables } from './use-variables';
import type { StoredResponse } from './use-variables';
import { ApiRequest, RequestState, FlowStep } from '@/types';

interface UseApiRequestReturn {
  requestState: RequestState;
  execute: (step: FlowStep) => Promise<void>;
  curlCommand: string;
  reset: () => void;
}

export function useApiRequest(stepId: string): UseApiRequestReturn {
  const progress = useVariables();
  const [curlCommand, setCurlCommand] = useState('');

  const [requestState, setRequestState] = useState<RequestState>(() => {
    const stored = progress.responses[stepId];
    if (stored) {
      return {
        isLoading: false,
        response: stored.response,
        error: stored.error,
        statusCode: stored.statusCode,
        executedAt: stored.executedAt ? new Date(stored.executedAt) : null,
      };
    }
    return {
      isLoading: false,
      response: null,
      error: null,
      executedAt: null,
      statusCode: undefined,
    };
  });

  const execute = useCallback(async (step: FlowStep) => {
    setRequestState({
      isLoading: true,
      response: null,
      error: null,
      executedAt: null,
      statusCode: undefined,
    });

    const currentVars = useVariables.getState().variables;

    const request: ApiRequest = {
      method: step.method,
      endpoint: step.endpoint,
      headers: step.headers,
      body: step.body,
    };

    const curl = generateCurlCommand(request, currentVars);
    setCurlCommand(curl);

    try {
      const { data, status } = await executeRequest(request, currentVars);

      const newState: RequestState = {
        isLoading: false,
        response: data,
        error: null,
        executedAt: new Date(),
        statusCode: status,
      };

      setRequestState(newState);

      const toStore: StoredResponse = {
        response: data,
        error: null,
        statusCode: status,
        executedAt: new Date().toISOString(),
      };
      progress.setResponse(stepId, toStore);
    } catch (error: unknown) {
      const err = error as { data?: unknown; status?: number; message?: string };

      const newState: RequestState = {
        isLoading: false,
        response: err.data || null,
        error: err.message || 'Request failed',
        executedAt: new Date(),
        statusCode: err.status,
      };

      setRequestState(newState);

      const toStore: StoredResponse = {
        response: err.data || null,
        error: err.message || 'Request failed',
        statusCode: err.status,
        executedAt: new Date().toISOString(),
      };
      progress.setResponse(stepId, toStore);
    }
  }, [stepId, progress]);

  const reset = useCallback(() => {
    setRequestState({
      isLoading: false,
      response: null,
      error: null,
      executedAt: null,
      statusCode: undefined,
    });
    setCurlCommand('');
    progress.clearResponse(stepId);
  }, [stepId, progress]);

  return {
    requestState,
    execute,
    curlCommand,
    reset,
  };
}
