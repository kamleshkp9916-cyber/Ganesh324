
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FOOTER_CONTENT_KEY, type FooterContent } from "./keys";

const defaultFooterContent: FooterContent = {
  description: "Your one-stop shop for live shopping. Discover, engage, and buy in real-time.",
  address: "123 Stream St, Commerce City, IN",
  phone: "(+91) 98765 43210",
  email: "support@nipher.in",
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  linkedin: "https://linkedin.com",
  instagram: "https://instagram.com",
};

export function FooterContentSettings() {
  const [storedContent, setStoredContent] = useLocalStorage<FooterContent>(FOOTER_CONTENT_KEY, defaultFooterContent);
  const [formState, setFormState] = useState<FooterContent>(defaultFooterContent);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormState(storedContent);
  }, [storedContent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setStoredContent(formState);
        toast({ title: "Footer Content Saved!", description: "Your changes will be reflected on the site." });
        setIsSaving(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer Content</CardTitle>
        <CardDescription>Manage the contact information and social links in the site footer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Footer Description</Label>
          <Textarea id="description" name="description" value={formState.description} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formState.address} onChange={handleChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formState.phone} onChange={handleChange} />
            </div>
             <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Support Email</Label>
                <Input id="email" name="email" type="email" value={formState.email} onChange={handleChange} />
            </div>
        </div>
         <div>
            <h4 className="font-medium mb-4 text-sm">Social Media Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook URL</Label>
                    <Input id="facebook" name="facebook" value={formState.facebook} onChange={handleChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X URL</Label>
                    <Input id="twitter" name="twitter" value={formState.twitter} onChange={handleChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input id="linkedin" name="linkedin" value={formState.linkedin} onChange={handleChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram URL</Label>
                    <Input id="instagram" name="instagram" value={formState.instagram} onChange={handleChange} />
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Save Footer Content
        </Button>
      </CardFooter>
    </Card>
  );
}
