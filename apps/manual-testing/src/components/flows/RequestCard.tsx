import { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FlowStep } from '@/types';
import { useApiRequest } from '@/hooks/use-api';
import { useVariables } from '@/hooks/use-variables';
import { ResponsePanel } from './ResponsePanel';
import { interpolateVariables } from '@/lib/api';
import { encrypt, decrypt, isCiphertext, unwrapEnc } from '@/lib/crypto';

interface RequestCardProps {
  step: FlowStep;
}

export function RequestCard({ step }: RequestCardProps) {
  const { requestState, execute, curlCommand } = useApiRequest(step.id);
  const { variables, setVariable, bodies, setBody } = useVariables();

  const [editedBody, setEditedBody] = useState<string>(
    bodies[step.id] ?? (step.body ? JSON.stringify(step.body, null, 2) : '')
  );

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState(false);
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Initialize: unwrap old ENC() markers, decrypt cached ciphertext, encrypt empty defaults
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const initial: Record<string, string> = {};
      const bodyUpdate: Record<string, unknown> = {};
      let needsBodyUpdate = false;

      try {
        const parsed = JSON.parse(editedBody);

        // email (plain)
        if (typeof parsed.email === 'string') initial.email = parsed.email;

        // encryptedEmail → derive plain email
        if (typeof parsed.encryptedEmail === 'string') {
          const val = parsed.encryptedEmail;
          if (val.startsWith('ENC(')) {
            initial.email = unwrapEnc(val);
          } else if (isCiphertext(val)) {
            try { initial.email = await decrypt(val); } catch {}
          }
          if (!val || val.startsWith('ENC(')) {
            needsBodyUpdate = true;
            bodyUpdate.encryptedEmail = await encrypt(initial.email || '');
          }
        }

        // encryptedFullName → derive plain fullName
        if (typeof parsed.encryptedFullName === 'string') {
          const val = parsed.encryptedFullName;
          if (val.startsWith('ENC(')) {
            initial.fullName = unwrapEnc(val);
          } else if (isCiphertext(val)) {
            try { initial.fullName = await decrypt(val); } catch {}
          } else if (val) {
            initial.fullName = val;
          }
          if (!val || val.startsWith('ENC(')) {
            needsBodyUpdate = true;
            bodyUpdate.encryptedFullName = await encrypt(initial.fullName || '');
          }
        }

        // trustStatus
        if (typeof parsed.trustStatus === 'string') initial.trustStatus = parsed.trustStatus;
      } catch {}

      if (cancelled) return;
      setFieldValues(initial);

      if (needsBodyUpdate) {
        try {
          const parsed = JSON.parse(editedBody);
          Object.assign(parsed, bodyUpdate);
          handleBodyChange(JSON.stringify(parsed, null, 2));
        } catch {}
      }

      setIsReady(true);
    };
    init();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBodyChange = (value: string) => {
    setEditedBody(value);
    setBody(step.id, value);
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariable(name, value);
  };

  const handlePlainChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    try {
      const parsed = JSON.parse(editedBody);
      parsed[key] = value;
      handleBodyChange(JSON.stringify(parsed, null, 2));
    } catch {}
  };

  const handleEncryptedSourceChange = (
    plainKey: string,
    encryptedKey: string,
    value: string
  ) => {
    setFieldValues((prev) => ({ ...prev, [plainKey]: value }));

    if (debounceRef.current[encryptedKey]) clearTimeout(debounceRef.current[encryptedKey]);
    debounceRef.current[encryptedKey] = setTimeout(async () => {
      try {
        const parsed = JSON.parse(editedBody);
        parsed[encryptedKey] = await encrypt(value);
        handleBodyChange(JSON.stringify(parsed, null, 2));
      } catch {}
    }, 500);
  };

  const handleExecute = async () => {
    const parsed = JSON.parse(editedBody);

    // Ensure encrypted fields are fresh before sending
    if (fieldValues.email) {
      parsed.encryptedEmail = await encrypt(fieldValues.email);
    }
    if (fieldValues.fullName) {
      parsed.encryptedFullName = await encrypt(fieldValues.fullName);
    }

    handleBodyChange(JSON.stringify(parsed, null, 2));

    const modifiedStep: FlowStep = {
      ...step,
      body: parsed,
    };
    execute(modifiedStep);
  };

  const getBodyValue = (key: string): string => {
    try {
      const v = JSON.parse(editedBody)[key];
      return typeof v === 'string' ? v : '';
    } catch {
      return '';
    }
  };

  const displayEndpoint = interpolateVariables(step.endpoint, variables);

  return (
    <Card className="mb-6" id={step.id}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-mono">
              Step {step.number}
            </span>
            <CardTitle className="text-base font-semibold">{step.title}</CardTitle>
          </div>
          <Badge variant="outline">{step.method}</Badge>
        </div>
        {step.description && (
          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        )}
        <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block font-mono">
          {displayEndpoint}
        </code>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Variables Used */}
        {step.variablesUsed.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Uses:</span>
            <div className="grid gap-2">
              {step.variablesUsed.map((varName) => (
                <div key={varName} className="flex items-center gap-2">
                  <code className="text-xs font-mono w-32 shrink-0">${varName}</code>
                  <Input
                    type="text"
                    placeholder={`Enter ${varName}...`}
                    value={variables[varName] || ''}
                    onChange={(e) => handleVariableChange(varName, e.target.value)}
                    className="h-7 text-xs font-mono"
                  />
                  {variables[varName] && (
                    <span className="text-xs text-muted-foreground shrink-0">set</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variables Created */}
        {step.variablesCreated.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Creates:</span>
            {step.variablesCreated.map((varName) => (
              <Badge key={varName} variant="outline">
                {varName}
              </Badge>
            ))}
          </div>
        )}

        <Tabs defaultValue="fields" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="body">JSON</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-2">
            <div className="grid gap-3">
              {/* email + encryptedEmail */}
              {typeof (step.body as Record<string, unknown> | null)?.email === 'string' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-mono w-32 shrink-0">email</label>
                    <Input
                      type="text"
                      value={fieldValues.email || ''}
                      onChange={(e) => {
                        handlePlainChange('email', e.target.value);
                        handleEncryptedSourceChange('email', 'encryptedEmail', e.target.value);
                      }}
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-mono w-32 shrink-0 text-muted-foreground">encryptedEmail</label>
                    <Input
                      type="text"
                      readOnly
                      value={isReady ? getBodyValue('encryptedEmail') : '...'}
                      className="h-7 text-xs font-mono bg-muted"
                    />
                  </div>
                </div>
              )}

              {/* fullName + encryptedFullName */}
              {'encryptedFullName' in (step.body as Record<string, unknown> || {}) && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-mono w-32 shrink-0">fullName</label>
                    <Input
                      type="text"
                      value={fieldValues.fullName || ''}
                      onChange={(e) => handleEncryptedSourceChange('fullName', 'encryptedFullName', e.target.value)}
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-mono w-32 shrink-0 text-muted-foreground">encryptedFullName</label>
                    <Input
                      type="text"
                      readOnly
                      value={isReady ? getBodyValue('encryptedFullName') : '...'}
                      className="h-7 text-xs font-mono bg-muted"
                    />
                  </div>
                </div>
              )}

              {/* Remaining fields */}
              {Object.entries(step.body || {}).map(([key, val]) => {
                if (['email', 'encryptedEmail', 'encryptedFullName'].includes(key)) return null;
                if (typeof val !== 'string') return null;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-xs font-mono w-32 shrink-0">{key}</label>
                    <Input
                      type="text"
                      value={fieldValues[key] ?? val}
                      onChange={(e) => handlePlainChange(key, e.target.value)}
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="body" className="space-y-2">
            {step.body ? (
              <Textarea
                value={editedBody}
                onChange={(e) => handleBodyChange(e.target.value)}
                className="font-mono text-xs min-h-[150px]"
                placeholder="Request body (JSON)"
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">No body for this request</p>
            )}
          </TabsContent>

          <TabsContent value="preview">
            <div className="bg-muted p-3 rounded-md text-xs space-y-2 font-mono">
              <p>{step.method} {displayEndpoint}</p>
              {step.body && (
                <pre className="mt-2">{editedBody}</pre>
              )}
            </div>
          </TabsContent>

          <TabsContent value="curl">
            <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto">
              <pre className="whitespace-pre-wrap">{curlCommand || 'Click Send to generate curl command'}</pre>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleExecute}
          disabled={requestState.isLoading}
          variant="outline"
          className="w-full"
        >
          {requestState.isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Sending...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Send Request
            </>
          )}
        </Button>

        <ResponsePanel requestState={requestState} />
      </CardContent>
    </Card>
  );
}
