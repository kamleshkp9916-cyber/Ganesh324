
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

export function SecuritySettings() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving settings
    setTimeout(() => {
        toast({ title: "Security Settings Saved" });
        setIsSaving(false);
    }, 1000);
  };
  
  const paymentGatewayUseCases = [
      { id: "accept-payments", label: "Accept Customer Payments" },
      { id: "process-payouts", label: "Process Seller Payouts" },
      { id: "handle-refunds", label: "Handle Customer Refunds" },
  ];

  return (
    <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Security</CardTitle>
            <CardDescription>
              Manage platform-wide security policies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Enforce Admin 2FA</h4>
                <p className="text-sm text-muted-foreground">Require all administrators to set up Two-Factor Authentication.</p>
              </div>
              <Switch />
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Password Complexity</h4>
              <p className="text-sm text-muted-foreground mb-4">Set complexity requirements for user and admin passwords.</p>
               <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Switch id="pw-length" defaultChecked />
                        <Label htmlFor="pw-length">Minimum 8 characters</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="pw-uppercase" />
                        <Label htmlFor="pw-uppercase">Require uppercase letter</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="pw-number" />
                        <Label htmlFor="pw-number">Require number</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="pw-special" />
                        <Label htmlFor="pw-special">Require special character</Label>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>API Key Configuration</CardTitle>
                <CardDescription>Manage third-party API credentials for your platform's services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">LiveKit Streaming API</h4>
                    <p className="text-xs text-muted-foreground -mt-3">Used for: Live Streaming Video & Audio</p>
                    <div className="space-y-2">
                        <Label htmlFor="livekit-host">LiveKit Host URL</Label>
                        <Input id="livekit-host" placeholder="wss://your-project.livekit.cloud" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="livekit-api-key">LiveKit API Key</Label>
                        <Input id="livekit-api-key" placeholder="APIkey..." type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="livekit-api-secret">LiveKit API Secret</Label>
                        <Input id="livekit-api-secret" placeholder="Secret..." type="password" />
                    </div>
                </div>
                 <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">0DIDit Verification API</h4>
                     <p className="text-xs text-muted-foreground -mt-3">Used for: Seller KYC Verification</p>
                     <div className="space-y-2">
                        <Label htmlFor="didit-api-key">0DIDit API Key</Label>
                        <Input id="didit-api-key" placeholder="didit_api_key..." type="password" />
                    </div>
                </div>
                 <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">Delivery Partner API</h4>
                     <p className="text-xs text-muted-foreground -mt-3">Used for: Order Fulfillment & Tracking</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="delivery-partner">Partner</Label>
                            <Select>
                                <SelectTrigger id="delivery-partner">
                                    <SelectValue placeholder="Select a partner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="shiprocket">Shiprocket</SelectItem>
                                    <SelectItem value="delhivery">Delhivery</SelectItem>
                                    <SelectItem value="ithinklogistics">iThinkLogistics</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="delivery-api-key">API Key</Label>
                            <Input id="delivery-api-key" type="password" />
                        </div>
                    </div>
                </div>
                 <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">Payment Gateway API</h4>
                    <p className="text-xs text-muted-foreground -mt-3">Used for: Processing all platform payments, refunds, and payouts.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="payment-gateway">Provider</Label>
                            <Select>
                                <SelectTrigger id="payment-gateway">
                                    <SelectValue placeholder="Select a provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="razorpay">Razorpay</SelectItem>
                                    <SelectItem value="stripe">Stripe</SelectItem>
                                    <SelectItem value="payu">PayU</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pg-api-key">API Key</Label>
                        <Input id="pg-api-key" placeholder="Key ID" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pg-api-secret">API Secret</Label>
                        <Input id="pg-api-secret" placeholder="Key Secret" type="password" />
                    </div>
                     <div className="space-y-2 pt-2">
                        <Label className="font-medium">Use For</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {paymentGatewayUseCases.map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                <Checkbox id={`pg-${item.id}`} defaultChecked />
                                <Label htmlFor={`pg-${item.id}`} className="text-sm font-normal">{item.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Security Settings
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
