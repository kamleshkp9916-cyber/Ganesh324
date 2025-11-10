
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { FooterContentSettings } from "./footer-content-settings";

export function PoliciesSettings() {
  return (
    <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content & Policies</CardTitle>
            <CardDescription>
              View and manage important site-wide documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Terms & Conditions
                </p>
                <p className="text-sm text-muted-foreground">
                  Last updated: 26 Aug, 2025
                </p>
              </div>
               <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm"><Link href="/terms-and-conditions" target="_blank">View</Link></Button>
                    <Button asChild size="sm">
                        <Link href="/admin/edit/terms">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>
            </div>
             <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Privacy Policy
                </p>
                <p className="text-sm text-muted-foreground">
                  Last updated: 26 Aug, 2025
                </p>
              </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm"><Link href="/privacy-and-security" target="_blank">View</Link></Button>
                    <Button asChild size="sm">
                        <Link href="/admin/edit/privacy">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
        <FooterContentSettings />
    </div>
  );
}

