
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { SECURITY_SETTINGS_KEY, type SecuritySettings } from "./keys";

const defaultSecuritySettings: SecuritySettings = {
  enforceAdmin2FA: false,
  passwordComplexity: {
    length: true,
    uppercase: false,
    number: false,
    special: false,
  },
  livekitHost: "",
  livekitApiKey: "",
  livekitApiSecret: "",
  diditApiKey: "",
  deliveryPartner: "",
  deliveryApiKey: "",
  paymentGateway: "",
  pgApiKey: "",
  pgApiSecret: "",
  pgUseCases: ["accept-payments", "process-payouts", "handle-refunds"],
};

export function SecuritySettings() {
  const [settings, setSettings] = useLocalStorage<SecuritySettings>(SECURITY_SETTINGS_KEY, defaultSecuritySettings);
  const [formState, setFormState] = useState<SecuritySettings>(defaultSecuritySettings);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: keyof SecuritySettings, value: boolean) => {
    setFormState(prev => ({...prev, [name]: value}));
  };

  const handlePasswordComplexityChange = (name: keyof SecuritySettings['passwordComplexity'], value: boolean) => {
      setFormState(prev => ({
          ...prev,
          passwordComplexity: {
              ...prev.passwordComplexity,
              [name]: value,
          }
      }));
  };

  const handleSelectChange = (name: keyof SecuritySettings, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: keyof SecuritySettings, checked: boolean, useCase: string) => {
      const currentUseCases = formState[name] as string[] || [];
      const newUseCases = checked 
          ? [...currentUseCases, useCase]
          : currentUseCases.filter(uc => uc !== useCase);
      setFormState(prev => ({ ...prev, [name]: newUseCases }));
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setSettings(formState);
        toast({ title: "Security Settings Saved" });
        setIsSaving(false);
    }, 1000);
  };
  
  const paymentGatewayUseCases = [
      { id: "accept-payments", label: "Accept Customer Payments" },
      { id: "process-payouts", label: "Process Seller Payouts" },
      { id: "handle-refunds", label: "Handle Customer Refunds (incl. cancelled orders)" },
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
              <Switch checked={formState.enforceAdmin2FA} onCheckedChange={(checked) => handleSwitchChange('enforceAdmin2FA', checked)} />
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Password Complexity</h4>
              <p className="text-sm text-muted-foreground mb-4">Set complexity requirements for user and admin passwords.</p>
               <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Switch id="pw-length" checked={formState.passwordComplexity.length} disabled />
                        <Label htmlFor="pw-length">Minimum 8 characters</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="pw-uppercase" checked={formState.passwordComplexity.uppercase} onCheckedChange={(checked) => handlePasswordComplexityChange('uppercase', checked)}/>
                        <Label htmlFor="pw-uppercase">Require uppercase letter</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="pw-number" checked={formState.passwordComplexity.number} onCheckedChange={(checked) => handlePasswordComplexityChange('number', checked)}/>
                        <Label htmlFor="pw-number">Require number</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="pw-special" checked={formState.passwordComplexity.special} onCheckedChange={(checked) => handlePasswordComplexityChange('special', checked)}/>
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
                        <Label htmlFor="livekitHost">LiveKit Host URL</Label>
                        <Input id="livekitHost" name="livekitHost" value={formState.livekitHost} onChange={handleChange} placeholder="wss://your-project.livekit.cloud" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="livekitApiKey">LiveKit API Key</Label>
                        <Input id="livekitApiKey" name="livekitApiKey" value={formState.livekitApiKey} onChange={handleChange} placeholder="APIkey..." type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="livekitApiSecret">LiveKit API Secret</Label>
                        <Input id="livekitApiSecret" name="livekitApiSecret" value={formState.livekitApiSecret} onChange={handleChange} placeholder="Secret..." type="password" />
                    </div>
                </div>
                 <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">0DIDit Verification API</h4>
                     <p className="text-xs text-muted-foreground -mt-3">Used for: Seller KYC Verification</p>
                     <div className="space-y-2">
                        <Label htmlFor="diditApiKey">0DIDit API Key</Label>
                        <Input id="diditApiKey" name="diditApiKey" value={formState.diditApiKey} onChange={handleChange} placeholder="didit_api_key..." type="password" />
                    </div>
                </div>
                 <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">Delivery Partner API</h4>
                     <p className="text-xs text-muted-foreground -mt-3">Used for: Order Fulfillment & Tracking</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="deliveryPartner">Partner</Label>
                            <Select value={formState.deliveryPartner} onValueChange={(value) => handleSelectChange('deliveryPartner', value)}>
                                <SelectTrigger id="deliveryPartner">
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
                            <Label htmlFor="deliveryApiKey">API Key</Label>
                            <Input id="deliveryApiKey" name="deliveryApiKey" value={formState.deliveryApiKey} onChange={handleChange} type="password" />
                        </div>
                    </div>
                </div>
                 <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">Payment Gateway API</h4>
                    <p className="text-xs text-muted-foreground -mt-3">Used for: Processing all platform payments, refunds, and payouts.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="paymentGateway">Provider</Label>
                            <Select value={formState.paymentGateway} onValueChange={(value) => handleSelectChange('paymentGateway', value)}>
                                <SelectTrigger id="paymentGateway">
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
                        <Label htmlFor="pgApiKey">API Key</Label>
                        <Input id="pgApiKey" name="pgApiKey" value={formState.pgApiKey} onChange={handleChange} placeholder="Key ID" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pgApiSecret">API Secret</Label>
                        <Input id="pgApiSecret" name="pgApiSecret" value={formState.pgApiSecret} onChange={handleChange} placeholder="Key Secret" type="password" />
                    </div>
                     <div className="space-y-2 pt-2">
                        <Label className="font-medium">Use For</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {paymentGatewayUseCases.map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                <Checkbox 
                                    id={`pg-${item.id}`} 
                                    checked={formState.pgUseCases.includes(item.id)}
                                    onCheckedChange={(checked) => handleCheckboxChange('pgUseCases', !!checked, item.id)}
                                />
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

    