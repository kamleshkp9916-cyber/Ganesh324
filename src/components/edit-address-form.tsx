
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit } from 'lucide-react';
import { indianStates } from "@/lib/data";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { DialogClose } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { updateUserData } from "@/lib/follow-data";

const addressSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Name is required." }),
  village: z.string().min(1, { message: "Address is required." }),
  district: z.string().min(1, { message: "District is required." }),
  city: z.string().min(1, { message: "City is required." }),
  country: z.string().default("India"),
  state: z.string().min(1, { message: "State is required." }),
  pincode: z.string().regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pin code." }),
  phone: z.string().regex(/^\+91 \d{10}$/, { message: "Please enter a valid 10-digit Indian phone number." }),
});

const formSchema = z.object({
    selectedAddressId: z.string().optional(),
    newAddress: addressSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.selectedAddressId === 'new' && !data.newAddress) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['newAddress'],
            message: 'Please fill out the new address details.',
        });
    }
});


interface EditAddressFormProps {
  onSave: (data: z.infer<typeof addressSchema>) => void;
  onCancel: () => void;
  // Let's also accept onAddressesUpdate to handle deletions from parent
  onAddressesUpdate?: (addresses: any[]) => void;
}

const mockAddresses = [
    {
        id: 1,
        name: "Samael Prajapati (Home)",
        village: "Koregaon Park",
        district: "Pune",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        pincode: "411001",
        phone: "+91 9876543210"
    },
    {
        id: 2,
        name: "Samael Prajapati (Work)",
        village: "Bandra West",
        district: "Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        pincode: "400050",
        phone: "+91 9876543211"
    }
];

export function EditAddressForm({ onSave, onCancel, onAddressesUpdate }: EditAddressFormProps) {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addresses, setAddresses] = useState(mockAddresses);
  const { user, userData } = useAuth();
  const { toast } = useToast();

   useEffect(() => {
    if (userData?.addresses) {
      setAddresses(userData.addresses);
    }
  }, [userData]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        selectedAddressId: addresses.length > 0 ? String(addresses[0].id) : undefined,
        newAddress: {
            name: '',
            village: '',
            district: '',
            city: '',
            state: '',
            pincode: '',
            phone: '+91 ',
            country: 'India',
        }
    }
  });

  const handleSave = (values: z.infer<typeof formSchema>) => {
    let newAddressList = [...addresses];
    if (showNewAddressForm && values.newAddress) {
        const newAddress = { ...values.newAddress, id: Date.now() };
        newAddressList.push(newAddress);
        if (onAddressesUpdate) {
            onAddressesUpdate(newAddressList);
        } else if (user) {
            updateUserData(user.uid, { addresses: newAddressList });
        }
        onSave(newAddress);

    } else if (values.selectedAddressId) {
        const selectedAddress = addresses.find(addr => String(addr.id) === values.selectedAddressId);
        if (selectedAddress) {
            onSave(selectedAddress);
        }
    }
    document.getElementById('edit-address-close')?.click();
  };
  
  const handleDelete = async (addressId: number) => {
    const newAddresses = addresses.filter(a => a.id !== addressId);
    setAddresses(newAddresses);
    if (onAddressesUpdate) {
      onAddressesUpdate(newAddresses);
    } else if (user) {
      await updateUserData(user.uid, { addresses: newAddresses });
    }
    toast({ title: "Address Deleted", description: "The address has been removed successfully." });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)}>
        <ScrollArea className="h-[65vh]">
            <div className="p-6">
                <FormField
                    control={form.control}
                    name="selectedAddressId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-semibold">Select an Address</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={(value) => { field.onChange(value); setShowNewAddressForm(false); }} defaultValue={field.value} className="mt-2 space-y-2">
                                    {addresses.map(address => (
                                        <div key={address.id} className="flex items-start gap-2 p-3 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                            <RadioGroupItem value={String(address.id)} id={`addr-${address.id}`} />
                                            <Label htmlFor={`addr-${address.id}`} className="flex-grow cursor-pointer text-sm">
                                                <p className="font-semibold text-foreground">{address.name}</p>
                                                <p>{address.village}, {address.district}</p>
                                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                                <p>Phone: {address.phone}</p>
                                            </Label>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this address? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(address.id)} className={cn(buttonVariants({ variant: "destructive" }))}>
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <Button type="button" variant="link" className="p-0 h-auto mt-4" onClick={() => {
                     setShowNewAddressForm(prev => !prev);
                     if (!showNewAddressForm) {
                         form.setValue('selectedAddressId', undefined);
                     }
                 }}>
                    <Plus className="mr-2 h-4 w-4" />
                    {showNewAddressForm ? 'Cancel' : 'Add a new address'}
                </Button>

                {showNewAddressForm && (
                     <div className="mt-4 pt-4 border-t space-y-4">
                         <h3 className="font-semibold">New Address Details</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="newAddress.name" render={({ field }) => (
                                 <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g. Samael Prajapati" {...field} /></FormControl><FormMessage /></FormItem>
                             )}/>
                             <FormField control={form.control} name="newAddress.phone" render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="+91 98765 43210"
                                            {...field}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                if (!value.startsWith('+91 ')) {
                                                    value = '+91 ' + value.replace(/\+91 /g, '').replace(/\D/g, '');
                                                }
                                                if (value.length > 14) {
                                                    value = value.substring(0, 14);
                                                }
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                             )}/>
                         </div>
                          <FormField control={form.control} name="newAddress.village" render={({ field }) => (
                                 <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="House no, street, area" {...field} /></FormControl><FormMessage /></FormItem>
                         )}/>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="newAddress.city" render={({ field }) => (
                                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="newAddress.district" render={({ field }) => (
                                <FormItem><FormLabel>District</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                         </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="newAddress.pincode" render={({ field }) => (
                                <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="newAddress.state" render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>State</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                         <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                                         <SelectContent><ScrollArea className="h-48">{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</ScrollArea></SelectContent>
                                     </Select>
                                     <FormMessage />
                                 </FormItem>
                             )}/>
                         </div>
                         <FormField control={form.control} name="newAddress.country" render={({ field }) => (
                            <FormItem><FormLabel>Country</FormLabel><FormControl><Input disabled {...field} value="India" /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-6">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" onClick={onCancel} id="edit-address-close">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Use this Address</Button>
                </div>
            </div>
        </ScrollArea>
      </form>
    </Form>
  );
}
