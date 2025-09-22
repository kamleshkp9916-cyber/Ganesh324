
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { submitInquiry, Inquiry } from "@/ai/flows/contact-flow";
import { Input } from "./ui/input";

export const FeedbackDialog = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [feedback, setFeedback] = useState("");
    const [subject, setSubject] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!feedback.trim() || !subject.trim()) {
            toast({
                variant: 'destructive',
                title: "Fields can't be empty",
                description: "Please provide a subject and your feedback.",
            });
            return;
        }
        setIsSubmitting(true);
        
        try {
            const inquiryData: Inquiry = {
                name: user?.displayName || "Anonymous User",
                email: user?.email || "anonymous@streamcart.com",
                subject: `Feedback: ${subject}`,
                message: feedback,
            };
            await submitInquiry(inquiryData);

            toast({
                title: "Feedback Received!",
                description: "Thank you for helping us improve StreamCart. Our team will review your feedback shortly.",
            });

            setFeedback("");
            setSubject("");
            document.getElementById('closeFeedbackDialog')?.click();

        } catch (error) {
            console.error("Feedback Submission Error:", error);
            toast({
                variant: 'destructive',
                title: "Submission Failed",
                description: "There was an issue submitting your feedback. Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Your Feedback</DialogTitle>
                    <DialogDescription>
                        We'd love to hear your thoughts. Report a bug, suggest a feature, or share any other comments about the site.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <div className="grid w-full gap-2">
                        <Label htmlFor="feedback-subject">Subject</Label>
                        <Input
                            id="feedback-subject"
                            placeholder="e.g., Bug in the video player"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="feedback-textarea">Your Feedback</Label>
                        <Textarea
                            id="feedback-textarea"
                            placeholder="Please describe the issue or your suggestion in detail..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={5}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" id="closeFeedbackDialog">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
