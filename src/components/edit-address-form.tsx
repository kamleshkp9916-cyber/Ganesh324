
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { MapPin, LocateFixed } from 'lucide-react';
import { indianStates } from "@/lib/data";

const formSchema = z.object({
  village: z.string().min(1, { message: "Village/Area is required." }),
  city: z.string().min(1, { message: "City is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  state: z.string().min(1, { message: "State is required." }),
  pincode: z.string().regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pin code." }),
  phone: z.string().regex(/^\+91 \d{10}$/, { message: "Please enter a valid 10-digit phone number with country code." }),
});

interface EditAddressFormProps {
  currentAddress: {
    village: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  currentPhone: string;
  onSave: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

export function EditAddressForm({ currentAddress, currentPhone, onSave, onCancel }: EditAddressFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      village: currentAddress.village,
      city: currentAddress.city,
      state: currentAddress.state,
      country: currentAddress.country,
      pincode: currentAddress.pincode,
      phone: currentPhone,
    },
  });

  const handleGetCurrentLocation = () => {
    // In a real app, you'd use navigator.geolocation here
    // For now, we just log a message
    console.log("Fetching current location...");
    // You could also pre-fill some fields based on a reverse geocoding API call
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="village"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Village / Area</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Koregaon Park" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
                <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Pune" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Pin Code</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., 411001" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
         <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., India" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        
        <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input placeholder="+91 9876543210" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        
        <div>
            <FormLabel>Pinpoint Location on Map</FormLabel>
            <div className="mt-2 flex flex-col md:flex-row gap-4">
                <div className="flex-grow h-40 rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <MapPin className="mx-auto h-8 w-8" />
                        <p className="text-sm">Map placeholder</p>
                    </div>
                </div>
                <Button type="button" variant="outline" className="md:self-end" onClick={handleGetCurrentLocation}>
                    <LocateFixed className="mr-2 h-4 w-4" />
                    Use Current Location
                </Button>
            </div>
        </div>


        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Details</Button>
        </div>
      </form>
    </Form>
  );
}
