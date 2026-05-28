import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFlowsByCategory } from '@/lib/flow-data';
import { FlowSection } from '@/components/flows/FlowSection';
import { useVariables } from '@/hooks/use-variables';

export function FlowTestPage() {
  const { category = 'core' } = useParams<{ category: string }>();
  const { variables, clearAll } = useVariables();

  const flows = getFlowsByCategory(category as 'core' | 'secondary' | 'setup');

  const scrollToFlow = (flowId: string) => {
    const el = document.getElementById(flowId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-xl font-semibold capitalize">{category} Flows</h1>
      </div>

      {/* Progress Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Stored Progress
          </CardTitle>
          <CardDescription>
            {Object.keys(variables).length} variable{Object.keys(variables).length !== 1 ? 's' : ''} cached in localStorage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={Object.keys(variables).length === 0}
            className="border-foreground/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Progress
          </Button>
        </CardContent>
      </Card>

      {/* Variables Display */}
      {Object.keys(variables).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(variables).map(([name, value]) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className="font-mono text-xs"
                  title={value}
                >
                  ${name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flow Navigation */}
      <div className="flex gap-2 overflow-auto pb-2">
        {flows.map((flow) => (
          <Button
            key={flow.id}
            variant="outline"
            size="sm"
            onClick={() => scrollToFlow(flow.id)}
            className="whitespace-nowrap"
          >
            {flow.title.split(':')[0]}
          </Button>
        ))}
      </div>

      {/* Flow Sections */}
      <div className="space-y-6">
        {flows.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No flows available for this category yet.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          flows.map((flow) => (
            <FlowSection
              key={flow.id}
              flow={flow}
              defaultOpen={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
