
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { EditAddressForm } from "./edit-address-form";
import { useState } from "react";

const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email(),
  bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
  location: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit Indian phone number." }),
});

const addressFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  village: z.string().min(1, { message: "Village/Area is required." }),
  district: z.string().min(1, { message: "District is required." }),
  city: z.string().min(1, { message: "City is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  state: z.string().min(1, { message: "State is required." }),
  pincode: z.string().regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pin code." }),
  phone: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit Indian phone number." }),
});

interface EditProfileFormProps {
  currentUser: {
    displayName: string;
    email: string;
    bio: string;
    location: string;
    phone: string;
    address: any;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function EditProfileForm({ currentUser, onSave, onCancel }: EditProfileFormProps) {
  const [firstName, ...lastName] = currentUser.displayName.split(" ");
  const [address, setAddress] = useState(currentUser.address);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName.join(" ") || "",
      email: currentUser.email,
      bio: currentUser.bio,
      location: currentUser.location,
      phone: (currentUser.phone || "").replace('+91 ', ''),
    },
  });

  const handleProfileSave = (values: z.infer<typeof profileFormSchema>) => {
    onSave({...values});
  };

  const handleAddressSave = (data: any) => {
    setAddress({
        name: data.name,
        village: data.village,
        district: data.district,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
    });
    onSave({ ...profileForm.getValues(), phone: data.phone, address: data })
  }

  return (
    <Tabs defaultValue="profile" className="w-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-6 self-center">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="address">Delivery Address</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="flex-grow">
            <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
                <ScrollArea className="h-[55vh] max-h-[55vh]">
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Samael" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Prajapati" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input disabled {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={profileForm.control}
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
                    <FormField
                        control={profileForm.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., New York, USA" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>About Me</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Tell us a little bit about yourself"
                                className="resize-none"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                </ScrollArea>
                <div className="flex justify-end gap-2 p-6 pt-2 border-t mt-auto">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
            </Form>
        </TabsContent>
        <TabsContent value="address" className="flex-grow">
            <EditAddressForm 
                currentAddress={address}
                currentPhone={currentUser.phone}
                onSave={handleAddressSave}
                onCancel={onCancel}
            />
        </TabsContent>
    </Tabs>
  );
}

    