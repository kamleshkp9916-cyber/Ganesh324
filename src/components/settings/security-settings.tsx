
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

export function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure security-related settings for the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Enforce Admin 2FA</h4>
            <p className="text-sm text-muted-foreground">Require all administrators to set up Two-Factor Authentication.</p>
          </div>
          <Switch />
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold">Password Complexity</h4>
          <p className="text-sm text-muted-foreground mb-4">Set complexity requirements for user and admin passwords.</p>
           <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Switch id="pw-length" defaultChecked />
                    <Label htmlFor="pw-length">Minimum 8 characters</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="pw-uppercase" />
                    <Label htmlFor="pw-uppercase">Require uppercase letter</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="pw-number" />
                    <Label htmlFor="pw-number">Require number</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="pw-special" />
                    <Label htmlFor="pw-special">Require special character</Label>
                </div>
            </div>
        </div>
      </CardContent>
       <CardFooter className="border-t pt-6 flex justify-end">
        <Button>Save Security Settings</Button>
      </CardFooter>
    </Card>
  );
}
