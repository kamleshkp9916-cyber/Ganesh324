
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useState, useEffect } from "react";

export const FOOTER_CONTENT_KEY = 'streamcart_footer_content';

export interface FooterContent {
  description: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
}

const defaultFooterContent: FooterContent = {
  description: "Your one-stop shop for live shopping. Discover, engage, and buy in real-time.",
  address: "123 Stream St, Commerce City, IN",
  phone: "(+91) 98765 43210",
  email: "streamcartcom@gmail.com",
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  linkedin: "https://linkedin.com",
  instagram: "https://instagram.com",
};


export function PoliciesSettings() {
    const [footerContent] = useLocalStorage<FooterContent>(FOOTER_CONTENT_KEY, defaultFooterContent);
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if(!isMounted) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content & Policies</CardTitle>
        <CardDescription>
          Edit your Terms of Service and Privacy Policy pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Terms & Conditions
            </p>
            <p className="text-sm text-muted-foreground">
              Modify the terms that govern the use of your platform.
            </p>
          </div>
           <Button asChild variant="outline">
                <Link href="/admin/edit/terms">
                    <Edit className="mr-2 h-4 w-4" /> Edit Page
                </Link>
            </Button>
        </div>
         <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Privacy Policy
            </p>
            <p className="text-sm text-muted-foreground">
              Update your policy on how you collect and use user data.
            </p>
          </div>
            <Button asChild variant="outline">
                <Link href="/admin/edit/privacy">
                    <Edit className="mr-2 h-4 w-4" /> Edit Page
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
