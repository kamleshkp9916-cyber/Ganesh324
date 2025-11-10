
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Edit, Ticket, Calendar as CalendarIcon, Upload } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { defaultCategories, Category } from "@/lib/categories";

export const PROMOTIONAL_SLIDES_KEY = 'streamcart_promotional_slides';

const slideSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  imageUrl: z.string().url("Please enter a valid URL."),
  expiresAt: z.date().optional(),
});

export type Slide = z.infer<typeof slideSchema>;

const SlideForm = ({ onSave, existingSlide, closeDialog }: { onSave: (slide: Slide) => void, existingSlide?: Slide, closeDialog: () => void }) => {
  const form = useForm<z.infer<typeof slideSchema>>({
    resolver: zodResolver(slideSchema),
    defaultValues: existingSlide || { title: "", description: "", imageUrl: "" },
  });

  const onSubmit = (values: z.infer<typeof slideSchema>) => {
    onSave({ ...values, id: existingSlide?.id || Date.now() });
    closeDialog();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Summer Sale" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., Up to 50% off!" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://images.unsplash.com/..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="expiresAt" render={({ field }) => (
            <FormItem className="flex flex-col"><FormLabel>Expiration Date (Optional)</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()-1)) } initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
        )}/>
        <DialogFooter className="pt-4"><Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button><Button type="submit">Save Slide</Button></DialogFooter>
      </form>
    </Form>
  );
};


export function PromotionsSettings() {
  const [slides, setSlides] = useLocalStorage<Slide[]>(PROMOTIONAL_SLIDES_KEY, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | undefined>(undefined);
  
  const handleSaveSlide = (slide: Slide) => {
    setSlides(prev => {
        const newSlides = [...prev];
        const existingIndex = newSlides.findIndex(s => s.id === slide.id);
        if(existingIndex > -1) {
            newSlides[existingIndex] = slide;
        } else {
            newSlides.push(slide);
        }
        return newSlides;
    });
  };

  const handleDeleteSlide = (slideId: number) => {
    setSlides(prev => prev.filter(s => s.id !== slideId));
  };
  
  const openForm = (slide?: Slide) => {
      setEditingSlide(slide);
      setIsFormOpen(true);
  };
  
  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Promotional Slides</CardTitle>
                    <CardDescription>Manage the rotating banners on the homepage.</CardDescription>
                </div>
                 <Button size="sm" onClick={() => openForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add Slide</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {slides.map(slide => (
                        <div key={slide.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                            <div className="flex items-center gap-4">
                                <img src={slide.imageUrl} alt={slide.title} className="w-24 h-16 object-cover rounded-md" />
                                <div>
                                    <h4 className="font-semibold">{slide.title}</h4>
                                    <p className="text-sm text-muted-foreground">{slide.description}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openForm(slide)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteSlide(slide.id!)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                    {slides.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No promotional slides have been added yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
        <SlideForm onSave={handleSaveSlide} existingSlide={editingSlide} closeDialog={() => setIsFormOpen(false)} />
    </Dialog>
  );
}
