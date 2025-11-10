
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminRevenuePage() {
  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>
              Analytics and reports on platform revenue will be displayed here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-20 text-muted-foreground">
                Content coming soon.
            </div>
          </CardContent>
        </Card>
      </main>
    </AdminLayout>
  );
}
