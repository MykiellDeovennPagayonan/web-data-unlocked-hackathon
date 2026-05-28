import { Link } from 'react-router-dom';
import { FlaskConical, ArrowRight, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { flows } from '@/lib/flow-data';
import { useVariables } from '@/hooks/use-variables';

export function Home() {
  const { variables, clearAll } = useVariables();
  const variableCount = Object.keys(variables).length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <div className="p-3 rounded-full border">
            <FlaskConical className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          TrustLayer Manual Testing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Visual interface for testing the TrustLayer backend API.
        </p>

        {variableCount > 0 && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {variableCount} variable{variableCount !== 1 ? 's' : ''} stored in localStorage
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="border-foreground/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Progress
            </Button>
          </div>
        )}
      </div>

      {/* Single Card */}
      <div className="max-w-md mx-auto">
        <Card className="border hover:border-foreground/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg border">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Core Flows</CardTitle>
            </div>
            <CardDescription>
              Essential trust evaluation flows: registration, certificates, community reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              {flows.length} flows • {flows.reduce((acc, f) => acc + f.steps.length, 0)} steps
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link to="/flows/core" className="flex items-center justify-center gap-2">
                Start Testing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Variables Summary */}
      {variableCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stored Variables</CardTitle>
            <CardDescription>
              These variables are available across all requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(variables).map(([name, value]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <code className="font-mono text-xs">${name}</code>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
