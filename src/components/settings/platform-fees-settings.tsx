
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { PLATFORM_FEES_KEY, ADDITIONAL_CHARGES_KEY, type PlatformFees, type AdditionalCharge } from "./keys";

const defaultFees: PlatformFees = {
  orderCommission: 3.0,
  superChatCommission: 16.0,
};

const defaultCharges: AdditionalCharge[] = [
    { id: 1, name: 'Convenience Fee', type: 'fixed', value: 25.00, displayLocation: ['Cart Summary', 'Payment Page'] },
];

export function PlatformFeeSettings() {
  const [fees, setFees] = useLocalStorage<PlatformFees>(PLATFORM_FEES_KEY, defaultFees);
  const [additionalCharges, setAdditionalCharges] = useLocalStorage<AdditionalCharge[]>(ADDITIONAL_CHARGES_KEY, defaultCharges);
  
  const [formState, setFormState] = useState<PlatformFees>(defaultFees);
  const [isSaving, setIsSaving] = useState(false);
  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<AdditionalCharge | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setFormState(fees);
  }, [fees]);
  
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setFees(formState);
        toast({ title: "Settings Saved", description: "Platform fee settings have been updated." });
        setIsSaving(false);
    }, 500);
  };
  
  const handleSaveCharge = (charge: Omit<AdditionalCharge, 'id'>) => {
    setAdditionalCharges(prev => {
        if(editingCharge) {
            return prev.map(c => c.id === editingCharge.id ? { ...charge, id: c.id } : c);
        } else {
            return [...prev, { ...charge, id: Date.now() }];
        }
    });
    setEditingCharge(null);
    setIsChargeFormOpen(false);
  };

  const handleDeleteCharge = (chargeId: number) => {
    setAdditionalCharges(prev => prev.filter(c => c.id !== chargeId));
  };
  
  const openChargeForm = (charge?: AdditionalCharge) => {
    setEditingCharge(charge || null);
    setIsChargeFormOpen(true);
  }

  return (
    <Dialog open={isChargeFormOpen} onOpenChange={setIsChargeFormOpen}>
        <div className="space-y-6">
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

             <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <div>
                            <CardTitle>Additional Charges</CardTitle>
                            <CardDescription>Create custom fees to apply at checkout.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => openChargeForm()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Charge
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                     {additionalCharges.map(charge => (
                         <div key={charge.id} className="flex items-center justify-between rounded-lg border p-3">
                             <div>
                                 <p className="font-semibold">{charge.name}</p>
                                 <p className="text-sm text-muted-foreground">
                                    {charge.type === 'fixed' ? `₹${charge.value.toFixed(2)}` : `${charge.value}%`}
                                 </p>
                                 <p className="text-xs text-muted-foreground">
                                    Display on: {charge.displayLocation.join(', ')}
                                 </p>
                             </div>
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openChargeForm(charge)}>Edit</Button>
                                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDeleteCharge(charge.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                         </div>
                     ))}
                     {additionalCharges.length === 0 && <p className="text-center text-muted-foreground py-6">No additional charges configured.</p>}
                </CardContent>
            </Card>
        </div>
         <ChargeFormDialog charge={editingCharge} onSave={handleSaveCharge} closeDialog={() => setIsChargeFormOpen(false)} />
    </Dialog>
  );
}

const ChargeFormDialog = ({ charge, onSave, closeDialog }: { charge: AdditionalCharge | null, onSave: (data: Omit<AdditionalCharge, 'id'>) => void, closeDialog: () => void }) => {
    const [name, setName] = useState(charge?.name || '');
    const [type, setType] = useState(charge?.type || 'fixed');
    const [value, setValue] = useState(charge?.value || 0);
    const [locations, setLocations] = useState(charge?.displayLocation || []);
    
    const displayLocations = ['Cart Summary', 'Payment Page', 'Order Invoice'];

    const handleSave = () => {
        onSave({ name, type, value, displayLocation: locations });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{charge ? 'Edit' : 'Create'} Additional Charge</DialogTitle>
                <DialogDescription>Define a new custom fee for your platform.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-1">
                    <Label>Charge Name</Label>
                    <Input placeholder="e.g., Convenience Fee" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as 'fixed' | 'percentage')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label>Value</Label>
                        <Input type="number" value={value} onChange={(e) => setValue(parseFloat(e.target.value) || 0)} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Display Location</Label>
                    <div className="space-y-1">
                        {displayLocations.map(loc => (
                            <div key={loc} className="flex items-center gap-2">
                                <Checkbox 
                                    id={`loc-${loc}`}
                                    checked={locations.includes(loc)}
                                    onCheckedChange={(checked) => {
                                        setLocations(prev => checked ? [...prev, loc] : prev.filter(l => l !== loc))
                                    }}
                                />
                                <Label htmlFor={`loc-${loc}`} className="font-normal">{loc}</Label>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleSave}>Save Charge</Button>
            </DialogFooter>
        </DialogContent>
    );
};
