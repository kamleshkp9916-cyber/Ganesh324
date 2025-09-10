
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleToggle = (setting: string, enabled: boolean) => {
    toast({
        title: "Setting Saved",
        description: `${setting} notifications have been ${enabled ? 'enabled' : 'disabled'}.`
    });
  };

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Notification Settings</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell /> Push Notifications
                    </CardTitle>
                    <CardDescription>
                        Manage the notifications you receive on your device.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="live-alerts" className="font-semibold">Live Stream Alerts</Label>
                        <Switch id="live-alerts" onCheckedChange={(checked) => handleToggle('Live Stream Alerts', checked)} defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="order-updates" className="font-semibold">Order Updates</Label>
                        <Switch id="order-updates" onCheckedChange={(checked) => handleToggle('Order Updates', checked)} defaultChecked />
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="new-messages" className="font-semibold">New Messages</Label>
                        <Switch id="new-messages" onCheckedChange={(checked) => handleToggle('New Messages', checked)} defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="promotions" className="font-semibold">Promotions & Offers</Label>
                        <Switch id="promotions" onCheckedChange={(checked) => handleToggle('Promotions', checked)} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
