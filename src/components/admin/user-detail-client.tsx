
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
  BookUser,
  LineChart,
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
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getUserData, UserData } from "@/lib/follow-data";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { getStatusFromTimeline } from "@/lib/order-data";
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

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

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    images: { preview: string }[];
};

type ViewType = 'orders' | 'products' | 'revenue';


export const UserDetailClient = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const { user: adminUser, userData: adminUserData, loading: adminLoading } = useAuth();
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('orders');


  useEffect(() => {
    const fetchAllData = async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const fetchedUserData = await getUserData(userId);
            if (!fetchedUserData) {
                setIsLoading(false);
                return;
            }
            setProfileData(fetchedUserData);

            const db = getFirestoreDb();
            
            // Fetch user orders
            const ordersRef = collection(db, "orders");
            const ordersQuery = query(ordersRef, where("userId", "==", userId), orderBy("orderDate", "desc"));
            const ordersSnapshot = await getDocs(ordersQuery);
            const fetchedOrders: Order[] = ordersSnapshot.docs.map(doc => ({
                ...doc.data(),
                orderId: doc.id
            } as Order));
            setUserOrders(fetchedOrders);

            // Fetch user products if they are a seller
            if (fetchedUserData.role === 'seller') {
                const productsKey = `sellerProducts_${fetchedUserData.displayName}`;
                const storedProducts = localStorage.getItem(productsKey);
                if (storedProducts) {
                    setUserProducts(JSON.parse(storedProducts));
                }
            }

        } catch (error) {
            console.error("Error fetching user details:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchAllData();
  }, [userId]);

  if (adminLoading) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
  }

  if (!adminUser || adminUserData?.role !== 'admin') {
      router.push('/');
      return null;
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!profileData) {
      return <div className="flex h-screen items-center justify-center"><p>User not found.</p></div>
  }

  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

  const renderActiveView = () => {
    switch(activeView) {
        case 'orders':
            return (
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
                                {isLoading ? (
                                    <>
                                        <TableRow><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                                        <TableRow><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                                    </>
                                ) : userOrders.length > 0 ? (
                                    userOrders.map(order => (
                                        <TableRow key={order.orderId}>
                                            <TableCell>
                                                <Link href={`/delivery-information/${encodeURIComponent(order.orderId)}`} className="font-medium hover:underline">{order.orderId}</Link>
                                            </TableCell>
                                            <TableCell>{order.products[0].name}{order.products.length > 1 ? ` + ${order.products.length - 1}` : ''}</TableCell>
                                            <TableCell><Badge variant={getStatusFromTimeline(order.timeline) === 'Delivered' ? 'success' : 'outline'}>{getStatusFromTimeline(order.timeline)}</Badge></TableCell>
                                            <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No orders found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            );
        case 'products':
             return (
                <Card>
                    <CardHeader>
                        <CardTitle>Listed Products</CardTitle>
                        <CardDescription>All products currently listed by {profileData.displayName}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userProducts.length > 0 ? (
                                    userProducts.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell className="text-right">₹{product.price.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">No products listed.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            );
        default:
            return <Card><CardContent className="p-6">Select a metric to view details.</CardContent></Card>;
    }
  }


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <Button size="icon" variant="outline" className="sm:hidden" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
             <Button size="icon" variant="ghost" className="hidden sm:inline-flex" onClick={() => router.push('/admin/users')}>
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
                            <CardTitle>User Metrics</CardTitle>
                             <CardDescription>Click a metric to see details.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2 text-sm">
                            <Button variant={activeView === 'orders' ? 'secondary' : 'ghost'} className="justify-start h-auto p-2" onClick={() => setActiveView('orders')}>
                                <div className="flex flex-col items-start">
                                    <span className="text-xs text-muted-foreground">Total Received Orders</span>
                                    <span className="text-lg font-bold">{userOrders.length}</span>
                                </div>
                            </Button>
                             <Button variant="ghost" className="justify-start h-auto p-2 cursor-not-allowed opacity-50">
                                <div className="flex flex-col items-start">
                                    <span className="text-xs text-muted-foreground">Total Spent</span>
                                    <span className="text-lg font-bold">₹{totalSpent.toLocaleString()}</span>
                                </div>
                            </Button>

                            {profileData.role === 'seller' && (
                                <>
                                 <Button variant={activeView === 'products' ? 'secondary' : 'ghost'} className="justify-start h-auto p-2" onClick={() => setActiveView('products')}>
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs text-muted-foreground">Products Listed</span>
                                        <span className="text-lg font-bold">{userProducts.length}</span>
                                    </div>
                                </Button>
                                <Button variant="ghost" className="justify-start h-auto p-2 cursor-not-allowed opacity-50">
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs text-muted-foreground">Total Revenue</span>
                                        <span className="text-lg font-bold">₹{totalSpent.toLocaleString()}</span>
                                    </div>
                                </Button>
                                 <Button variant="ghost" className="justify-start h-auto p-2 cursor-not-allowed opacity-50">
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs text-muted-foreground">Total Live Streams</span>
                                        <span className="text-lg font-bold">0</span>
                                    </div>
                                </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                    {renderActiveView()}
                </div>
            </div>
        </main>
    </div>
  );
};
