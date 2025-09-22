
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const FeedbackDialog = ({ children }: { children: React.ReactNode }) => {
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!feedback.trim()) {
            toast({
                variant: 'destructive',
                title: "Feedback can't be empty",
                description: "Please write something before submitting.",
            });
            return;
        }
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Feedback Submitted:", feedback);
            toast({
                title: "Feedback Received!",
                description: "Thank you for helping us improve StreamCart.",
            });
            setFeedback("");
            setIsSubmitting(false);
            document.getElementById('closeFeedbackDialog')?.click();
        }, 1000);
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
                        We'd love to hear your thoughts on what we can improve.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="grid w-full gap-2">
                        <Label htmlFor="feedback-textarea">Your Feedback</Label>
                        <Textarea
                            id="feedback-textarea"
                            placeholder="What's on your mind?"
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
