
import { AdminLayout } from "@/components/admin/admin-layout";
import { UserDetailClient } from "@/components/admin/user-detail-client";

export default function UserDetailPage({ params }: { params: { userId: string } }) {
    return (
        <AdminLayout>
            <UserDetailClient userId={params.userId} />
        </AdminLayout>
    );
}

    