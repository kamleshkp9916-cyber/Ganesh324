
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { submitInquiry, Inquiry } from "@/ai/flows/contact-flow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const inquirySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
});


export default function ContactUsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof inquirySchema>>({
        resolver: zodResolver(inquirySchema),
        defaultValues: {
            name: user?.displayName || "",
            email: user?.email || "",
            subject: "",
            message: "",
            category: "General Inquiry",
        },
    });
    
    const inquiryCategories = ["Business", "Seller Onboarding", "Collaboration", "Legal", "Feedback", "Other"];

    const onSubmit = async (values: z.infer<typeof inquirySchema>) => {
        setIsLoading(true);
        try {
            const inquiryData: Omit<Inquiry, 'createdAt' | 'id'> = {
                ...values,
                status: "New",
                priority: "Medium",
            };

            const result = await submitInquiry(inquiryData);

            toast({
                title: "Inquiry Submitted!",
                description: "Thank you for contacting us. We will get back to you shortly.",
            });
            form.reset();
            router.push('/live-selling');

        } catch(error) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was an error sending your message. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
          <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Contact Us</h1>
            <div className="w-10"></div>
          </header>

          <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
             <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>Have a question or feedback? Fill out the form below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Your Email</FormLabel><FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{inquiryCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Partnership Inquiry" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="message" render={({ field }) => (
                                <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Write your message here..." {...field} rows={5}/></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Send Message
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
             </Card>
          </main>
        </div>
    );
}
