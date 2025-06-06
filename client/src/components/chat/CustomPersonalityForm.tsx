import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomPersonality, BuiltInPersonalityType } from '@/contexts/ChatContext';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(20, "Name must be at most 20 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(100, "Description must be at most 100 characters"),
  instructions: z.string().min(30, "Instructions must be at least 30 characters").max(500, "Instructions must be at most 500 characters"),
  basePersonality: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomPersonalityFormProps {
  onPersonalityCreated: (personality: CustomPersonality) => void;
  existingPersonalities: CustomPersonality[];
  prebuiltPersonalities: { value: string; label: string; }[];
}

export function CustomPersonalityForm({ 
  onPersonalityCreated, 
  existingPersonalities,
  prebuiltPersonalities
}: CustomPersonalityFormProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      instructions: '',
      basePersonality: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    // Check if personality with this name already exists
    const nameExists = existingPersonalities.some(
      p => p.name.toLowerCase() === data.name.toLowerCase()
    );

    if (nameExists) {
      toast({
        title: "Personality name already exists",
        description: "Please choose a different name for your custom personality.",
        variant: "destructive",
      });
      return;
    }

    // Create unique ID for the personality
    const id = `custom_${Date.now().toString(36)}`;
    
    // Convert basePersonality to the right type (or undefined)
    const baseType = data.basePersonality as BuiltInPersonalityType | undefined;
    
    // Create the custom personality
    const newPersonality: CustomPersonality = {
      id,
      name: data.name,
      description: data.description,
      instructions: data.instructions,
      basePersonality: baseType,
      isCustom: true,
    };

    // Add personality
    onPersonalityCreated(newPersonality);
    
    // Show success message
    toast({
      title: "Personality created",
      description: `Your custom personality "${data.name}" has been created.`,
    });

    // Reset form and close dialog
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Personality
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Custom AI Personality</DialogTitle>
          <DialogDescription>
            Design your own AI personality with custom instructions and behavior patterns.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personality Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Mindful Coach" {...field} />
                  </FormControl>
                  <FormDescription>
                    A short, memorable name for your custom personality.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E.g., Focuses on mindfulness and present-moment awareness" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of how this personality responds.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePersonality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Personality (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a base personality style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None (Start from scratch)</SelectItem>
                      {prebuiltPersonalities.map(personality => (
                        <SelectItem key={personality.value} value={personality.value}>
                          {personality.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Starting from a base personality can help define the tone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personality Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="E.g., Respond with mindful observations, use gentle language, ask reflective questions, and encourage present-moment awareness." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed instructions for how this personality should respond to messages.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Personality</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}