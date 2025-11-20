
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2, PlusCircle, Ticket, Calendar, Clock } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, Suspense } from "react";
import { submitInquiry, Inquiry } from "@/ai/flows/contact-flow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import Link from 'next/link';

const TICKET_STORAGE_KEY = 'user_support_tickets';

const ticketSchema = z.object({
  category: z.string().min(1, { message: "Please select a category." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const ticketCategories = ["General Inquiry", "Technical Support", "Billing Issue", "Account Management", "Feedback", "Order Issue", "Payment Issue"];

const mockTickets = [
    { id: '#TCK-001', subject: "Where is my order?", status: 'Closed', category: 'Order Issue', lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), userId: 'support' },
    { id: '#TCK-002', subject: "Payment failed but amount deducted", status: 'Open', category: 'Payment Issue', lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), userId: 'support' },
];


function RaiseTicketContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [tickets, setTickets] = useLocalStorage<(Inquiry & {id: string, userId?: string})[]>(TICKET_STORAGE_KEY, mockTickets);

    const subjectFromParams = searchParams.get('subject');

    const form = useForm<z.infer<typeof ticketSchema>>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            category: "General Inquiry",
            subject: subjectFromParams || "",
            message: "",
        },
    });

    useEffect(() => {
        if(subjectFromParams) {
            form.setValue("subject", subjectFromParams);
            setIsFormOpen(true);
        }
    }, [subjectFromParams, form]);


    const onSubmit = async (values: z.infer<typeof ticketSchema>) => {
        setIsLoading(true);
        try {
            const inquiryData = {
                ...values,
                name: user?.displayName || "N/A",
                email: user?.email || "N/A",
                status: "New",
                priority: "Medium",
            } as Omit<Inquiry, 'createdAt' | 'id'>;

            const newTicket = { ...inquiryData, id: `#TCK-${Date.now()}`, lastUpdate: new Date().toISOString(), userId: 'support' };
            setTickets(prev => [newTicket, ...prev]);
            
            toast({
                title: "Ticket Submitted!",
                description: "Thank you for contacting support. We will get back to you shortly.",
            });
            form.reset({ category: "General Inquiry", subject: "", message: "" });
            setIsFormOpen(false);

        } catch(error) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was an error creating your ticket. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Support Center</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-grow p-4 md:p-8">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>My Support Tickets</CardTitle>
                            <CardDescription>View your past and current support requests.</CardDescription>
                        </div>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> New Ticket</Button>
                        </DialogTrigger>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {tickets.map(ticket => (
                             <Link key={ticket.id} href={`/feed?tab=messages&userId=${ticket.userId || 'support'}&userName=Support&ticketId=${encodeURIComponent(ticket.id)}`} className="block">
                                <div className="border p-4 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div>
                                        <p className="font-semibold">{ticket.subject}</p>
                                        <p className="text-sm text-muted-foreground">{ticket.id} • Category: {ticket.category}</p>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            Last updated: {format(new Date(ticket.lastUpdate), "dd MMM, yyyy")}
                                        </p>
                                    </div>
                                    <Badge variant={ticket.status === 'Open' ? 'success' : 'outline'}>{ticket.status}</Badge>
                                </div>
                            </Link>
                        ))}
                         {tickets.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">You have no support tickets.</div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <DialogContent className="max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>Raise a New Support Ticket</DialogTitle>
                    <DialogDescription>Our support team will get back to you as soon as possible.</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category for your issue" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {ticketCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Issue with order #12345" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Please describe your issue in detail</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="The more details you provide, the faster we can help." {...field} rows={6}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                             <DialogClose asChild>
                                <Button type="button" variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Submit Ticket
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
            </div>
        </Dialog>
    );
}

export default function RaiseTicketPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <RaiseTicketContent />
        </Suspense>
    );
}
