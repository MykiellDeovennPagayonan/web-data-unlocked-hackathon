import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RequestState } from '@/types';
import { useVariables } from '@/hooks/use-variables';

interface ResponsePanelProps {
  requestState: RequestState;
}

export function ResponsePanel({ requestState }: ResponsePanelProps) {
  const [copied, setCopied] = useState(false);
  const { variables } = useVariables();

  const handleCopy = () => {
    if (requestState.response) {
      navigator.clipboard.writeText(JSON.stringify(requestState.response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (requestState.isLoading) {
    return (
      <Card className="mt-4 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Sending request...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requestState.error && !requestState.response) {
    return (
      <Card className="mt-4 border-destructive">
        <CardContent className="p-4">
          <div className="text-destructive">
            <p className="font-medium">Request Failed</p>
            <p className="text-sm">{requestState.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!requestState.response) {
    return null;
  }

  const statusText = requestState.statusCode && requestState.statusCode < 400 ? 'OK' : 'Error';

  // Helper to highlight variables in the JSON
  const highlightVariables = (key: string, value: unknown): React.ReactNode => {
    if (typeof value === 'string' && Object.values(variables).includes(value)) {
      const varName = Object.entries(variables).find(([, v]) => v === value)?.[0];
      return (
        <span className="text-green-600 dark:text-green-400" title={`Stored as $${varName}`}>
          {JSON.stringify(value)}
        </span>
      );
    }
    return JSON.stringify(value);
  };

  const formatJson = (obj: unknown, indent = 0): string => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Response</span>
            {requestState.statusCode && (
              <Badge variant="outline">
                {requestState.statusCode} {statusText}
              </Badge>
            )}
            {requestState.executedAt && (
              <span className="text-xs text-muted-foreground">
                {requestState.executedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <pre className="bg-muted p-3 rounded-md overflow-auto max-h-96 text-xs">
          <code>{formatJson(requestState.response)}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
