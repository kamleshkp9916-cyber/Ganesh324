
import { UserDetailClient } from "@/components/admin/user-detail-client";

export default function UserDetailPage({ params }: { params: { userId: string } }) {
    return <UserDetailClient userId={params.userId} />;
}
