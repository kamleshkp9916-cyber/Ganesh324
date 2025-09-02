
"use client"

import {
  ArrowLeft,
  BadgeEuro,
  DollarSign,
  Eye,
  File,
  Mail,
  MapPin,
  Menu,
  MoreVertical,
  Package,
  Phone,
  RadioTower,
  ShieldCheck,
  ShoppingBag,
  User,
  UserCheck,
  UserX,
  Wallet,
} from "lucide-react"
import { useEffect, useState } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthActions } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast"
import { getUserData, UserData } from "@/lib/follow-data";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { getStatusFromTimeline } from "@/lib/order-data";
import Image from "next/image"

type Order = {
    orderId: string;
    userId: string;
    products: any[];
    address: any;
    total: number;
    orderDate: string;
    isReturnable: boolean;
    timeline: any[];
};

export const UserDetailClient = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const { user: adminUser, userData: adminUserData, loading: adminLoading } = useAuth();
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        try {
            // Fetch user data
            const fetchedUserData = await getUserData(userId);
            if (!fetchedUserData) {
                // Handle user not found
                setIsLoading(false);
                return;
            }
            setProfileData(fetchedUserData);

            // Fetch user orders
            const db = getFirestoreDb();
            const ordersRef = collection(db, "orders");
            const q = query(ordersRef, where("userId", "==", userId), orderBy("orderDate", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedOrders: Order[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                orderId: doc.id
            } as Order));
            setUserOrders(fetchedOrders);

        } catch (error) {
            console.error("Error fetching user details:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchAllData();
  }, [userId]);

  if (adminLoading || isLoading) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
  }

  if (!adminUser || adminUserData?.role !== 'admin') {
      router.push('/');
      return null;
  }

  if (!profileData) {
      return <div className="flex h-screen items-center justify-center"><p>User not found.</p></div>
  }

  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <Button size="icon" variant="outline" className="sm:hidden" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                User Profile
            </h1>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="outline">Suspend</Button>
                <Button>Save</Button>
            </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={profileData.photoURL} />
                                    <AvatarFallback>{profileData.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{profileData.displayName}</CardTitle>
                                     <Badge variant={profileData.role === 'seller' ? 'secondary' : 'outline'}>{profileData.role}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> <span>{profileData.email}</span></div>
                            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <span>{profileData.phone || 'N/A'}</span></div>
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{profileData.location || 'N/A'}</span></div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Key Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total Orders</span>
                                <span>{userOrders.length}</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total Spent</span>
                                <span>₹{totalSpent.toLocaleString()}</span>
                            </div>
                            {profileData.role === 'seller' && (
                                <>
                                 <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total Revenue</span>
                                    <span>₹{userOrders.reduce((s,o) => s + o.total, 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Products Listed</span>
                                    <span>{0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Live Streams</span>
                                    <span>{0}</span>
                                </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>A list of all orders placed by this user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userOrders.map(order => (
                                         <TableRow key={order.orderId}>
                                            <TableCell>
                                                <Link href={`/delivery-information/${order.orderId}`} className="font-medium hover:underline">{order.orderId}</Link>
                                            </TableCell>
                                            <TableCell>{order.products[0].name}{order.products.length > 1 ? ` + ${order.products.length-1}`: ''}</TableCell>
                                            <TableCell><Badge variant={getStatusFromTimeline(order.timeline) === 'Delivered' ? 'success' : 'outline'}>{getStatusFromTimeline(order.timeline)}</Badge></TableCell>
                                            <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {userOrders.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No orders found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </div>
  );
};
