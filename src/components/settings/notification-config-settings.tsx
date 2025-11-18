
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";

export function NotificationConfigSettings() {
  const [sendgridKey, setSendgridKey] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsSaving(true);
    // In a real app, these values would be saved securely to your backend/environment variables.
    setTimeout(() => {
        console.log("Saving Notification Settings:", { sendgridKey, senderEmail, twilioSid, twilioAuthToken, twilioPhoneNumber });
        toast({ title: "Settings Saved", description: "Your notification provider settings have been updated." });
        setIsSaving(false);
    }, 1000);
  };
  
  const emailUseCases = [
      { id: "pw-reset", label: "Password Resets" },
      { id: "marketing", label: "Marketing Campaigns" },
      { id: "abandoned-cart", label: "Abandoned Cart Reminders" },
      { id: "login-alerts", label: "New Login Alerts" },
      { id: "email-otp", label: "Email-based OTPs" },
      { id: "logout-notification", label: "Logout Notifications" },
  ];
  
   const smsUseCases = [
      { id: "sms-otp", label: "Phone Number Verification (OTP)" },
      { id: "order-updates", label: "Order Status Updates" },
      { id: "delivery-notifications", label: "Delivery Notifications" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Configuration</CardTitle>
        <CardDescription>
          Manage API keys and settings for your SMS and email providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold flex items-center gap-2 mb-4"><Mail className="h-5 w-5 text-primary" /> Email Provider (SendGrid)</h4>
           <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="sendgrid-key">SendGrid API Key</Label>
                <Input id="sendgrid-key" type="password" placeholder="SG.********************************" value={sendgridKey} onChange={(e) => setSendgridKey(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sender-email">Default Sender Email</Label>
                <Input id="sender-email" type="email" placeholder="you@yourdomain.com" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
              </div>
              <div className="space-y-2 pt-2">
                <Label className="font-medium">Use For</Label>
                <div className="grid grid-cols-2 gap-2">
                  {emailUseCases.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox id={`email-${item.id}`} defaultChecked />
                      <Label htmlFor={`email-${item.id}`} className="text-sm font-normal">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>

        <Separator />

        <div className="p-4 border rounded-lg">
           <h4 className="font-semibold flex items-center gap-2 mb-4"><MessageSquare className="h-5 w-5 text-primary" /> SMS Provider (Twilio)</h4>
           <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="twilio-sid">Twilio Account SID</Label>
                <Input id="twilio-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="twilio-token">Twilio Auth Token</Label>
                <Input id="twilio-token" type="password" value={twilioAuthToken} onChange={(e) => setTwilioAuthToken(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="twilio-phone">Twilio Phone Number</Label>
                <Input id="twilio-phone" placeholder="+15017122661" value={twilioPhoneNumber} onChange={(e) => setTwilioPhoneNumber(e.target.value)} />
              </div>
              <div className="space-y-2 pt-2">
                <Label className="font-medium">Use For</Label>
                <div className="grid grid-cols-2 gap-2">
                  {smsUseCases.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox id={`sms-${item.id}`} defaultChecked />
                      <Label htmlFor={`sms-${item.id}`} className="text-sm font-normal">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </CardContent>
       <CardFooter className="border-t pt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Save Notification Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
