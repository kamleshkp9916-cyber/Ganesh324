
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminFeedPage() {
  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Feed Management</CardTitle>
            <CardDescription>
              Tools for managing the global content feed will be available here.
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
