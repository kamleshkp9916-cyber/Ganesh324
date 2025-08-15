
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

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email(),
  bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
  location: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit Indian phone number." }),
});

interface EditProfileFormProps {
  currentUser: {
    displayName: string;
    email: string;
    bio: string;
    location: string;
    phone: string;
  };
  onSave: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

export function EditProfileForm({ currentUser, onSave, onCancel }: EditProfileFormProps) {
  const [firstName, ...lastName] = currentUser.displayName.split(" ");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName.join(" ") || "",
      email: currentUser.email,
      bio: currentUser.bio,
      location: currentUser.location,
      phone: (currentUser.phone || "").replace('+91 ', ''),
    },
  });

  const handleSave = (values: z.infer<typeof formSchema>) => {
    onSave(values);
  };

  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(handleSave)} className="flex flex-col h-full">
            <ScrollArea className="flex-grow p-6">
                 <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
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
                            control={form.control}
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
                        control={form.control}
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
                    <FormField
                        control={form.control}
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
                        control={form.control}
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
             <div className="flex justify-end gap-2 p-4 border-t bg-background">
              <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
       </form>
    </Form>
  );
}
