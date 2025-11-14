

"use client"

import {
  ArrowLeft,
  DollarSign,
  Eye,
  Mail,
  MapPin,
  Package,
  Phone,
  RadioTower,
  ShieldCheck,
  ShoppingBag,
  Star,
  User,
  Wallet,
  LineChart,
  MessageSquare,
  PackageCheck,
  PackageOpen,
  Hourglass,
  Circle,
  XCircle,
  Truck,
  CheckCircle2,
  Home,
  ShieldAlert,
  Banknote,
  Percent,
  Slash,
  Calendar,
  Ban,
  Receipt, // Added Receipt
} from "lucide-react"
import { useEffect, useState, useMemo } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge, BadgeProps } from "@/components/ui/badge"
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
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getUserData, UserData, updateUserData, getMockSellers } from "@/lib/follow-data";
import { getFirestoreDb } from "@/lib/firebase";
import { getStatusFromTimeline, Order } from "@/lib/order-data";
import { Transaction, getTransactions } from "@/lib/transaction-history";
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { collection, query, where, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { format, parseISO } from "date-fns";


type Product = {
    id: string;
    key: string;
    name: string;
    price: number;
    category: string;
    images: { preview: string }[];
};

type ViewType = 'orders' | 'products' | 'revenue';

const mockOrders: Order[] = [
    {
        orderId: "#MOCK123",
        userId: "mockUser",
        products: [{ name: "Mock Product 1", key: "mock_1", productId: "mock_1" }],
        address: { name: "Mock User", village: "123 Mockingbird Lane", city: "Faketown", state: "CA", pincode: "90210", phone: "1234567890" },
        total: 1999.00,
        orderDate: "2024-08-01T10:00:00.000Z",
        isReturnable: true,
        timeline: [{ status: "Delivered", date: "Aug 05, 2024", time: "02:00 PM", completed: true }],
        paymentMethod: 'Credit Card',
        refundStatus: 'N/A',
        transactionId: 'txn_1a2b3c4d5e6f'
    },
];

const mockProducts: Product[] = [
    { id: 'mock_1', key: 'mock_1', name: 'Mock Seller Product A', price: 1999.00, category: 'Electronics', images: [{ preview: 'https://placehold.co/100x100.png' }] },
];


export const UserDetailClient = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const { user: adminUser, userData: adminUserData, loading: adminLoading } = useAuth();
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState<Order | null>(null);
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<any[]>([]);

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
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load user profile.' });
                setIsLoading(false);
                return;
            }
            setProfileData(fetchedUserData);

            const db = getFirestoreDb();
            
            const ordersRef = collection(db, "orders");
            const ordersQuery = query(ordersRef, where("userId", "==", userId));
            const ordersSnapshot = await getDocs(ordersQuery);
            const fetchedOrders: Order[] = ordersSnapshot.docs.map(doc => ({
                ...doc.data(),
                orderId: doc.id
            } as Order));
            setUserOrders(fetchedOrders.length > 0 ? fetchedOrders : []);
            
            const allTransactions = getTransactions();
            const transactionsForUser = allTransactions.filter(t => fetchedOrders.some(o => o.transactionId === t.transactionId) || t.description.includes(fetchedUserData.displayName));
            setUserTransactions(transactionsForUser);


            if (fetchedUserData.role === 'seller') {
                const sellerId = fetchedUserData.uid;
                const mockSellers = getMockSellers();
                const mockSellerData = mockSellers.find(s => s.uid === sellerId);
                const sellerProducts = mockSellerData ? mockProducts : [];
                setUserProducts(sellerProducts);

                 const payoutsQuery = query(collection(db, "payouts"), where("sellerId", "==", userId), orderBy("requestedAt", "desc"));
                 onSnapshot(payoutsQuery, (snapshot) => {
                    const fetchedPayouts = snapshot.docs.map(doc => doc.data());
                    setPayouts(fetchedPayouts);
                });
            }

        } catch (error) {
            console.error("Error fetching user details:", error);
            setUserOrders([]);
            setUserProducts([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchAllData();
  }, [userId, toast]);
  

  const sellerRevenueData = useMemo(() => {
    const deliveredOrders = userOrders.filter(o => getStatusFromTimeline(o.timeline) === 'Delivered');
    const totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const platformCommission = totalEarnings * 0.03;
    const totalWithdrawn = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

    const monthlyRevenue = deliveredOrders.reduce((acc, order) => {
        const month = format(new Date(order.orderDate), 'MMM');
        acc[month] = (acc[month] || 0) + order.total;
        return acc;
    }, {} as Record<string, number>);
    
    const chartData = Object.entries(monthlyRevenue).map(([name, revenue]) => ({ name, revenue }));

    return { totalEarnings, platformCommission, totalWithdrawn, pendingPayouts, chartData };
  }, [userOrders, payouts]);


  if (adminLoading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>
  }

  if (!adminUser || adminUserData?.role !== 'admin') {
      router.push('/');
      return null;
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!profileData) {
      return <div className="flex h-full items-center justify-center"><p>User not found.</p></div>
  }

  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = userOrders.length;
  const cancelledOrders = userOrders.filter(o => getStatusFromTimeline(o.timeline).toLowerCase().includes('cancelled')).length;
  const returnedOrders = userOrders.filter(o => getStatusFromTimeline(o.timeline).toLowerCase().includes('return')).length;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const sellerAverageRating = 4.8;

  const renderRevenueView = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardHeader><CardTitle>Total Earnings</CardTitle><CardDescription>Gross revenue from sales</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{sellerRevenueData.totalEarnings.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Platform Commission</CardTitle><CardDescription>3% fee on earnings</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{sellerRevenueData.platformCommission.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Total Withdrawn</CardTitle><CardDescription>All completed payouts</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{sellerRevenueData.totalWithdrawn.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Pending Payouts</CardTitle><CardDescription>Awaiting admin approval</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{sellerRevenueData.pendingPayouts.toLocaleString()}</p></CardContent></Card>
        </div>
         <Card>
            <CardHeader>
                <CardTitle>Seller Revenue Timeline</CardTitle>
                <CardDescription>Monthly gross sales revenue for this seller.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sellerRevenueData.chartData}>
                        <XAxis dataKey="name" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <main className="flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Dialog onOpenChange={(open) => !open && setSelectedOrderForTimeline(null)}>
            <div className="space-y-6">
                 <div className="flex items-center justify-between gap-4">
                     <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight sm:grow-0">
                        User Profile
                    </h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/messages?userId=${profileData.uid}&userName=${profileData.displayName}`}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Ban className="mr-2 h-4 w-4" />
                                    Terminate User
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Terminate User Account</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You can temporarily suspend or permanently delete this user's account. Permanent deletion cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <Button variant="outline">Suspend for 7 days</Button>
                                    <AlertDialogAction asChild>
                                        <Button variant="destructive">Permanently Delete</Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-6 lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={profileData.photoURL} />
                                        <AvatarFallback>{profileData.displayName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="flex items-center gap-2">{profileData.displayName}
                                            {profileData.role === 'seller' && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Star className="h-3 w-3" /> {sellerAverageRating}
                                            </Badge>
                                        )}
                                        </CardTitle>
                                            <Badge variant={profileData.role === 'admin' ? 'destructive' : profileData.role === 'seller' ? 'secondary' : 'outline'}>{profileData.role}</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> <span>{profileData.email}</span></div>
                                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <span>{profileData.phone || 'N/A'}</span></div>
                                    <div className="flex items-start gap-2 pt-2">
                                    <Home className="h-4 w-4 text-muted-foreground mt-1" /> 
                                    <div>
                                        <p className="font-semibold text-foreground">Address</p>
                                        {profileData.addresses && profileData.addresses.length > 0 ? (
                                            <address className="not-italic text-muted-foreground">
                                                {profileData.addresses[0].name}<br/>
                                                {profileData.addresses[0].village}, {profileData.addresses[0].district}<br/>
                                                {profileData.addresses[0].city}, {profileData.addresses[0].state} - {profileData.addresses[0].pincode}<br/>
                                                Phone: {profileData.addresses[0].phone}
                                            </address>
                                        ) : <p className="text-muted-foreground">No address on file.</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>{profileData.role === 'seller' ? "Seller Stats" : "User Stats"}</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-4 text-sm">
                                {profileData.role === 'seller' ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Total Earnings</span>
                                            <span className="font-semibold">₹{sellerRevenueData.totalEarnings.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Products Listed</span>
                                            <span className="font-semibold">{userProducts.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Total Orders</span>
                                            <span className="font-semibold">{totalOrders}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Avg. Rating</span>
                                            <span className="font-semibold flex items-center gap-1">{sellerAverageRating} <Star className="h-4 w-4 text-yellow-400" /></span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Total Spent</span>
                                            <span className="font-semibold">₹{totalSpent.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Total Orders</span>
                                            <span className="font-semibold">{totalOrders}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Cancelled Orders</span>
                                            <span className="font-semibold">{cancelledOrders}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Returned Orders</span>
                                            <span className="font-semibold">{returnedOrders}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Avg. Order Value</span>
                                            <span className="font-semibold">₹{avgOrderValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                        <Tabs defaultValue="orders">
                            <TabsList>
                                <TabsTrigger value="orders">Orders</TabsTrigger>
                                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                {profileData.role === 'seller' && <TabsTrigger value="products">Products</TabsTrigger>}
                                {profileData.role === 'seller' && <TabsTrigger value="revenue">Revenue</TabsTrigger>}
                            </TabsList>
                            <TabsContent value="orders">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order History</CardTitle>
                                        <CardDescription>A list of all orders placed by this user.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Product</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {isLoading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow> : userOrders.length > 0 ? userOrders.map(order => (
                                                    <TableRow key={order.orderId}>
                                                        <TableCell><Link href={`/admin/orders/${encodeURIComponent(order.orderId)}`} className="font-medium hover:underline">{order.orderId}</Link></TableCell>
                                                        <TableCell><Link href={`/product/${order.products[0].key}`} className="hover:underline">{order.products[0].name}{order.products.length > 1 ? ` + ${order.products.length - 1}` : ''}</Link></TableCell>
                                                        <TableCell><Badge variant={getStatusFromTimeline(order.timeline) === 'Delivered' ? 'success' : 'outline'}>{getStatusFromTimeline(order.timeline)}</Badge></TableCell>
                                                        <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No orders found.</TableCell></TableRow>}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="transactions">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transaction History</CardTitle>
                                        <CardDescription>A list of all financial transactions associated with this user.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Transaction ID</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {userTransactions.length > 0 ? userTransactions.map(t => (
                                                    <TableRow key={t.id}>
                                                        <TableCell className="font-mono text-xs">{t.transactionId}</TableCell>
                                                        <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                                                        <TableCell><Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Processing' ? 'warning' : 'destructive'}>{t.status}</Badge></TableCell>
                                                        <TableCell className={cn("text-right font-medium", t.amount > 0 ? "text-green-600" : "text-foreground")}>
                                                            {t.amount > 0 ? '+' : ''}₹{t.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                        </TableCell>
                                                    </TableRow>
                                                )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No transactions found.</TableCell></TableRow>}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="products">
                                    <Card>
                                    <CardHeader><CardTitle>Listed Products</CardTitle><CardDescription>Products listed by {profileData.displayName}.</CardDescription></CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {userProducts.length > 0 ? userProducts.map(product => (
                                                    <TableRow key={product.id}><TableCell className="font-medium"><Link href={`/product/${product.key}`} className="hover:underline">{product.name}</Link></TableCell><TableCell>{product.category}</TableCell><TableCell className="text-right">₹{product.price.toLocaleString()}</TableCell></TableRow>
                                                )) : <TableRow><TableCell colSpan={3} className="text-center h-24">No products listed.</TableCell></TableRow>}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="revenue">
                                {renderRevenueView()}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Dialog>
    </main>
  );
};
