
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminLoading() {
  return (
    <AdminLayout>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-2/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-3 w-1/2 mt-2" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-2/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-3 w-1/2 mt-2" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-2/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-3 w-1/2 mt-2" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-2/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-3 w-1/2 mt-2" />
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-2/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </main>
    </AdminLayout>
  )
}
