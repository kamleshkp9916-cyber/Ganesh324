
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const SHIPPING_SETTINGS_KEY = 'streamcart_shipping_settings';

export interface ShippingSettings {
  deliveryCharge: number;
}

const defaultSettings: ShippingSettings = {
  deliveryCharge: 50.00
};

export function ShippingSettingsComponent() {
  const [settings, setSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultSettings);
  const [deliveryCharge, setDeliveryCharge] = useState(settings.deliveryCharge);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDeliveryCharge(settings.deliveryCharge);
  }, [settings]);
  
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setSettings({ deliveryCharge: Number(deliveryCharge) });
        toast({ title: "Settings Saved", description: "Shipping settings have been updated." });
        setIsSaving(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping & Delivery</CardTitle>
        <CardDescription>Configure flat-rate delivery charges for all orders.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="delivery-charge">Flat-Rate Delivery Charge (₹)</Label>
          <Input 
            id="delivery-charge" 
            type="number" 
            value={deliveryCharge}
            onChange={(e) => setDeliveryCharge(Number(e.target.value))}
            className="mt-1"
          />
           <p className="text-xs text-muted-foreground mt-1">This amount will be added to every order at checkout.</p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
