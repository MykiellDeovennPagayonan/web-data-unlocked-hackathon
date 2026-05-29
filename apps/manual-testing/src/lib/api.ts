import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ApiRequest, VariableStore } from '@/types';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interpolate variables in a string
 * Replace $VAR_NAME or {{VAR_NAME}} with actual values from store
 */
export function interpolateVariables(str: string, variables: VariableStore): string {
  // Replace $VAR_NAME format
  let result = str.replace(/\$([A-Z_][A-Z_0-9]*)/g, (match, varName) => {
    return variables[varName] || match;
  });
  
  // Replace {{VAR_NAME}} format
  result = result.replace(/\{\{([A-Z_][A-Z_0-9]*)\}\}/g, (match, varName) => {
    return variables[varName] || match;
  });
  
  return result;
}

/**
 * Deep interpolate variables in an object
 */
export function interpolateObject(obj: unknown, variables: VariableStore): unknown {
  if (typeof obj === 'string') {
    return interpolateVariables(obj, variables);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => interpolateObject(item, variables));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, variables);
    }
    return result;
  }
  
  return obj;
}

/**
 * Execute an API request
 */
export async function executeRequest(
  request: ApiRequest,
  variables: VariableStore
): Promise<{ data: unknown; status: number }> {
  // Interpolate variables in endpoint
  const endpoint = interpolateVariables(request.endpoint, variables);

  // Interpolate variables in body
  const body = request.body ? interpolateObject(request.body, variables) : null;

  // Build headers
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(request.headers)) {
    headers[key] = typeof value === 'string' ? interpolateVariables(value, variables) : value;
  }

  const config: AxiosRequestConfig = {
    method: request.method as AxiosRequestConfig['method'],
    url: endpoint,
    headers,
    data: body,
  };
  
  try {
    const response = await api(config);
    return { data: response.data, status: response.status };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw {
        data: error.response.data,
        status: error.response.status,
        message: error.message,
      };
    }
    throw error;
  }
}

/**
 * Extract variable values from response data
 * Looks for common ID fields like id, platformId, identityId, etc.
 */
export function extractVariables(
  data: unknown,
  variableNames: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const dataObj = data as Record<string, unknown>;
    
    for (const varName of variableNames) {
      // Try exact match first
      if (typeof dataObj[varName] === 'string') {
        result[varName] = dataObj[varName] as string;
        continue;
      }
      
      // Try common patterns
      const idKey = varName.replace(/_ID$/, '').toLowerCase() + 'Id';
      if (typeof dataObj.id === 'string') {
        // If the variable name looks like XXX_ID, map the 'id' field to it
        if (varName.endsWith('_ID')) {
          result[varName] = dataObj.id as string;
        }
      }
      
      // Try snake_case to camelCase conversion
      const camelKey = varName.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (typeof dataObj[camelKey] === 'string') {
        result[varName] = dataObj[camelKey] as string;
      }
      
      // Try raw key
      if (typeof dataObj[varName.toLowerCase()] === 'string') {
        result[varName] = dataObj[varName.toLowerCase()] as string;
      }
    }
  }
  
  return result;
}

/**
 * Generate curl command equivalent for preview
 */
export function generateCurlCommand(
  request: ApiRequest,
  variables: VariableStore
): string {
  const endpoint = interpolateVariables(request.endpoint, variables);
  const body = request.body ? interpolateObject(request.body, variables) : null;

  let cmd = `curl -s -X ${request.method.toUpperCase()} "http://localhost:8090${endpoint}"`;

  // Add headers
  const headers = { ...request.headers };

  for (const [key, value] of Object.entries(headers)) {
    const interpolatedValue = typeof value === 'string' ? interpolateVariables(value, variables) : value;
    cmd += ` \\\n  -H "${key}: ${interpolatedValue}"`;
  }
  
  // Add body
  if (body) {
    cmd += ` \\\n  -d '${JSON.stringify(body)}'`;
  }
  
  cmd += ' | jq';
  
  return cmd;
}

export default api;
