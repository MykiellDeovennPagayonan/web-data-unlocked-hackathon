import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Flow } from '@/types';
import { RequestCard } from './RequestCard';

interface FlowSectionProps {
  flow: Flow;
  defaultOpen?: boolean;
}

export function FlowSection({ flow, defaultOpen = true }: FlowSectionProps) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? flow.id : undefined} id={flow.id}>
      <AccordionItem value={flow.id} className="border rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-t-lg">
          <div className="flex flex-col items-start text-left">
            <h3 className="font-semibold text-lg">{flow.title}</h3>
            <p className="text-sm text-muted-foreground font-normal">
              {flow.description}
            </p>
            <span className="text-xs text-muted-foreground mt-1">
              {flow.steps.length} steps
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4 mt-2">
            {flow.steps.map((step) => (
              <RequestCard key={step.id} step={step} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
