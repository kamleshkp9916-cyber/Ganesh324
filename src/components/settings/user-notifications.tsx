
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UserNotificationsSettings() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please provide both a title and a message.",
      });
      return;
    }
    
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Notification Sent!",
        description: `Your message "${title}" has been sent to all users.`,
      });
      setTitle("");
      setMessage("");
      setIsSending(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Notifications</CardTitle>
        <CardDescription>
          Send notifications to all users or a specific user. This feature is currently disabled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="announcement" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="announcement">Announcement</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
          </TabsList>
          <TabsContent value="announcement" className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  placeholder="e.g., New Feature Added!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-message">Message</Label>
                <Textarea
                  id="announcement-message"
                  placeholder="Describe the announcement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleSend} disabled={isSending}>
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send to All Users
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="warning" className="pt-6 text-center text-muted-foreground">
            <p>Warning notifications are not yet implemented.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
