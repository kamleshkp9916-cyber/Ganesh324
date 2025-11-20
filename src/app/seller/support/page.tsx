
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SellerHeader } from "@/components/seller/seller-header";
import { LifeBuoy, ChevronRight, Ticket, Send, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const supportTopics = [
    { title: "Payout Delays", description: "Inquire about the status of a pending or delayed payout." },
    { title: "Product Listing Issue", description: "Get help with products that aren't appearing correctly." },
    { title: "Technical Problem with Live Stream", description: "Report issues with starting or running a live stream." },
    { title: "Account Suspension Appeal", description: "Appeal a decision regarding your account's status." },
    { title: "Fee & Commission Inquiry", description: "Ask questions about platform fees or commission charges." },
    { title: "Other", description: "For any other issues not listed above." },
];

const ticketSchema = z.object({
  subject: z.string(),
  details: z.string().min(10, "Please provide more details about your issue."),
});

const SupportTicketForm = ({ subject, onSubmit, isLoading }: { subject: string, onSubmit: (values: z.infer<typeof ticketSchema>) => void, isLoading: boolean }) => {
    const form = useForm<z.infer<typeof ticketSchema>>({
        resolver: zodResolver(ticketSchema),
        defaultValues: { subject, details: "" },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl><Input {...field} disabled /></FormControl>
                    </FormItem>
                )} />
                <FormField control={form.control} name="details" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Details</FormLabel>
                        <FormControl>
                            <Textarea {...field} placeholder="Please describe your issue in detail..." rows={5} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Ticket
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

export default function SellerSupportPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTopicClick = (title: string) => {
        setSelectedSubject(title);
        setIsFormOpen(true);
    };

    const handleTicketSubmit = async (values: z.infer<typeof ticketSchema>) => {
        setIsSubmitting(true);
        // Here you would integrate with your backend to create the ticket
        console.log("New ticket submitted:", {
            sellerId: user?.uid,
            subject: values.subject,
            details: values.details,
        });

        // Simulate API call
        await new Promise(res => setTimeout(res, 1000));
        
        toast({
            title: "Support Ticket Created!",
            description: "Our support team will get back to you within 24-48 hours.",
        });
        
        setIsSubmitting(false);
        setIsFormOpen(false);
        router.push('/seller/messages?executive=true');
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <div className="flex min-h-screen w-full flex-col">
                <SellerHeader />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-full text-primary">
                                    <LifeBuoy className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle>Seller Support Center</CardTitle>
                                    <CardDescription>Get help with common issues or raise a support ticket.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {supportTopics.map(topic => (
                                <button key={topic.title} onClick={() => handleTopicClick(topic.title)} className="w-full text-left">
                                    <Card className="hover:bg-muted/50 transition-colors">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{topic.title}</p>
                                                <p className="text-sm text-muted-foreground">{topic.description}</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </CardContent>
                                    </Card>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </main>
            </div>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Ticket /> Raise a Support Ticket</DialogTitle>
                    <DialogDescription>Provide details about your issue. A support agent will respond in your messages.</DialogDescription>
                </DialogHeader>
                <SupportTicketForm subject={selectedSubject} onSubmit={handleTicketSubmit} isLoading={isSubmitting} />
            </DialogContent>
        </Dialog>
    );
}
