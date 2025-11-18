
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotificationConfigSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Configuration</CardTitle>
        <CardDescription>
          Manage settings for SMS, email, and push notifications. This is a placeholder for future functionality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold">SMS Provider Settings</h4>
          <p className="text-sm text-muted-foreground">Twilio / Vonage API keys and settings will go here.</p>
        </div>
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold">Email Provider Settings</h4>
          <p className="text-sm text-muted-foreground">SendGrid / Mailgun API keys and templates will be configured here.</p>
        </div>
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold">Push Notification Keys</h4>
          <p className="text-sm text-muted-foreground">Firebase Cloud Messaging (FCM) server keys and VAPID keys will be managed here.</p>
        </div>
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold">Notification Templates</h4>
          <p className="text-sm text-muted-foreground">An editor for email, SMS, and push notification templates will be available here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
