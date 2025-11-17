
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const PLATFORM_FEES_KEY = 'streamcart_platform_fees';

export interface PlatformFees {
  orderCommission: number;
  superChatCommission: number;
}

const defaultFees: PlatformFees = {
  orderCommission: 3.0,
  superChatCommission: 16.0,
};

export function PlatformFeeSettings() {
  const [fees, setFees] = useLocalStorage<PlatformFees>(PLATFORM_FEES_KEY, defaultFees);
  const [formState, setFormState] = useState<PlatformFees>(fees);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setFees(formState);
        toast({ title: "Settings Saved", description: "Platform fee settings have been updated." });
        setIsSaving(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Fees & Charges</CardTitle>
        <CardDescription>Set the commission rates for various transactions on the platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg">
          <Label htmlFor="order-commission">Order Commission (%)</Label>
          <Input 
            id="order-commission" 
            type="number" 
            value={formState.orderCommission}
            onChange={(e) => setFormState(prev => ({...prev, orderCommission: parseFloat(e.target.value) || 0}))}
            className="mt-1"
          />
           <p className="text-xs text-muted-foreground mt-1">The percentage fee taken from each completed seller order.</p>
        </div>
        <div className="p-4 border rounded-lg">
          <Label htmlFor="superchat-commission">Super Chat Commission (%)</Label>
          <Input 
            id="superchat-commission" 
            type="number" 
            value={formState.superChatCommission}
            onChange={(e) => setFormState(prev => ({...prev, superChatCommission: parseFloat(e.target.value) || 0}))}
            className="mt-1"
          />
           <p className="text-xs text-muted-foreground mt-1">The percentage fee taken from Super Chat donations during live streams.</p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Save Fee Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
