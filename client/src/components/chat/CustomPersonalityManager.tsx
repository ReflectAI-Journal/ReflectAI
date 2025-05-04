import React from 'react';
import { CustomPersonality } from '@/contexts/ChatContext';
import { CustomPersonalityForm } from './CustomPersonalityForm';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Edit, 
  Trash, 
  Check,
  Lightbulb,
  Brain,
  UserPlus
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CustomPersonalityManagerProps {
  customPersonalities: CustomPersonality[];
  onPersonalityCreated: (personality: CustomPersonality) => void;
  onPersonalityDeleted: (personalityId: string) => void;
  onPersonalitySelected: (personalityId: string) => void;
  selectedPersonalityId: string;
  prebuiltPersonalities: { value: string; label: string; }[];
}

export function CustomPersonalityManager({
  customPersonalities,
  onPersonalityCreated,
  onPersonalityDeleted,
  onPersonalitySelected,
  selectedPersonalityId,
  prebuiltPersonalities
}: CustomPersonalityManagerProps) {
  const { toast } = useToast();
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const handleDelete = (id: string) => {
    onPersonalityDeleted(id);
    setConfirmDeleteId(null);
    toast({
      title: "Personality deleted",
      description: "Your custom personality has been deleted.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Personalities</h3>
        <CustomPersonalityForm
          onPersonalityCreated={onPersonalityCreated}
          existingPersonalities={customPersonalities}
          prebuiltPersonalities={prebuiltPersonalities}
        />
      </div>

      {customPersonalities.length === 0 ? (
        <Card className="border-dashed bg-muted/50">
          <CardContent className="py-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary/70" />
              </div>
            </div>
            <h3 className="font-medium text-muted-foreground">No custom personalities yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your own AI personalities with custom instructions and behavior.
            </p>
            <CustomPersonalityForm
              onPersonalityCreated={onPersonalityCreated}
              existingPersonalities={customPersonalities}
              prebuiltPersonalities={prebuiltPersonalities}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {customPersonalities.map((personality) => (
            <Card 
              key={personality.id}
              className={`transition-all hover:shadow-md ${
                selectedPersonalityId === personality.id 
                  ? 'border-primary/40 bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                      {personality.basePersonality === 'socratic' ? (
                        <Brain className="h-4 w-4" />
                      ) : (
                        <Lightbulb className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{personality.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {personality.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onPersonalitySelected(personality.id)}
                        disabled={selectedPersonalityId === personality.id}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Use this personality
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setConfirmDeleteId(personality.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {personality.basePersonality && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Based on: {prebuiltPersonalities.find(p => p.value === personality.basePersonality)?.label || personality.basePersonality}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="pb-3">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="instructions" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm">
                      View Instructions
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {personality.instructions}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  variant={selectedPersonalityId === personality.id ? "default" : "outline"} 
                  size="sm"
                  className="w-full"
                  onClick={() => onPersonalitySelected(personality.id)}
                >
                  {selectedPersonalityId === personality.id ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    "Select Personality"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Deleting */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Personality</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this custom personality? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}