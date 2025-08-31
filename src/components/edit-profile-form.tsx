
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
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Upload } from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email(),
  bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
  location: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit Indian phone number." }),
  photoURL: z.string().optional(),
});

interface EditProfileFormProps {
  currentUser: {
    displayName: string;
    email: string;
    bio: string;
    location: string;
    phone: string;
    photoURL?: string;
    addresses: any;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function EditProfileForm({ currentUser, onSave, onCancel }: EditProfileFormProps) {
  const [firstName, ...lastName] = currentUser.displayName.split(" ");
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName.join(" ") || "",
      email: currentUser.email,
      bio: currentUser.bio,
      location: currentUser.location,
      phone: (currentUser.phone || "").replace('+91 ', ''),
      photoURL: currentUser.photoURL,
    },
  });

  const handleProfileSave = (values: z.infer<typeof profileFormSchema>) => {
    onSave({...values, addresses: currentUser.addresses, photoURL: photoPreview });
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setPhotoPreview(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

  return (
    <Form {...profileForm}>
    <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
        <ScrollArea className="h-[55vh] max-h-[55vh]">
        <div className="p-6 space-y-4">
             <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={photoPreview || undefined} />
                    <AvatarFallback>{firstName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                 <div>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload new picture
                    </Button>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    <p className="text-xs text-muted-foreground mt-2">Recommended: 200x200px, PNG or JPG</p>
                </div>
            </div>
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
  );
}
