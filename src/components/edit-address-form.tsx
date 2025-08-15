
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
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  village: z.string().min(1, { message: "Village/Area is required." }),
  district: z.string().min(1, { message: "District is required." }),
  city: z.string().min(1, { message: "City is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  state: z.string().min(1, { message: "State is required." }),
  pincode: z.string().regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pin code." }),
  phone: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit Indian phone number." }),
});

interface EditAddressFormProps {
  currentAddress: {
    name: string;
    village: string;
    district: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  currentPhone: string;
  onSave: (data: z.infer<typeof formSchema> & { phone: string }) => void;
  onCancel: () => void;
}

export function EditAddressForm({ currentAddress, currentPhone, onSave, onCancel }: EditAddressFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentAddress.name,
      village: currentAddress.village,
      district: currentAddress.district,
      city: currentAddress.city,
      state: currentAddress.state,
      country: currentAddress.country,
      pincode: currentAddress.pincode,
      phone: (currentPhone || "").replace('+91 ', ''),
    },
  });
  
  const handleSave = (values: z.infer<typeof formSchema>) => {
    onSave({ ...values, phone: `+91 ${values.phone}` });
  };


  const handleGetCurrentLocation = () => {
    // In a real app, you'd use navigator.geolocation here
    // For now, we just log a message
    console.log("Fetching current location...");
    // You could also pre-fill some fields based on a reverse geocoding API call
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="flex flex-col flex-grow min-h-0">
        <ScrollArea className="flex-grow">
          <div className="grid gap-4 px-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Samael Prajapati" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
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
                        <ScrollArea className="h-48">
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., India" disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground text-sm">
                            +91
                        </div>
                        <FormControl>
                            <Input 
                                placeholder="98765 43210" 
                                className="pl-10"
                                {...field}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 10) {
                                        field.onChange(value);
                                    }
                                }}
                            />
                        </FormControl>
                    </div>
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
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-6 flex-shrink-0 border-t">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Details</Button>
        </div>
      </form>
    </Form>
  );
}
