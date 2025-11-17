

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
  Receipt,
  MoreHorizontal,
  Clock,
  MessageCircle,
  Gavel,
  Shield,
  Notebook,
} from "lucide-react"
import { useEffect, useState, useMemo, useCallback } from "react";
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
import { collection, query, where, getDocs, orderBy, onSnapshot, doc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase-db";
import { format, parseISO } from "date-fns";
import { liveSellers } from "@/lib/product-data"
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";


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
        products: [{ name: "Mock Product 1", key: "mock_1", productId: "mock_1", imageUrl: "https://placehold.co/100x100.png" }],
        address: { name: "Mock User", village: "123 Mockingbird Lane", city: "Faketown", state: "CA", pincode: "90210", phone: "1234567890" },
        total: 1999.00,
        orderDate: "2024-08-01T10:00:00.000Z",
        isReturnable: true,
        timeline: [{ status: "Delivered", date: "Aug 05, 2024", time: "02:00 PM", completed: true }],
    },
];

const mockTransactions: Transaction[] = [
    { id: 1, transactionId: 'txn_1a2b3c4d5e6f', orderId: '#ORD5896', buyerName: 'Ganesh Prajapati', type: 'Order', description: 'Mock Product 1', date: '2024-08-01', time: '10:00 AM', amount: -1999.00, status: 'Completed' },
    { id: 2, transactionId: 'txn_xyz789', type: 'Deposit', description: 'Wallet Top-up', date: '2024-07-30', time: '03:45 PM', amount: 5000.00, status: 'Completed' },
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
  const [revenueDetailView, setRevenueDetailView] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");


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
            setAdminNotes((fetchedUserData as any).adminNotes || '');

            const db = getFirestoreDb();
            
            const ordersRef = collection(db, "orders");
            const ordersQuery = query(ordersRef, where("userId", "==", userId));
            const ordersSnapshot = await getDocs(ordersQuery);
            const fetchedOrders: Order[] = ordersSnapshot.docs.map(doc => ({
                ...doc.data(),
                orderId: doc.id
            } as Order));
            setUserOrders(fetchedOrders.length > 0 ? fetchedOrders : mockOrders);
            
            const allTransactions = getTransactions();
            const transactionsForUser = allTransactions.filter(t => fetchedOrders.some(o => o.transactionId === t.transactionId) || t.description.includes(fetchedUserData.displayName));
            setUserTransactions(transactionsForUser.length > 0 ? transactionsForUser : mockTransactions);


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
            setUserOrders(mockOrders);
            setUserProducts(mockProducts);
            setUserTransactions(mockTransactions);
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
  const totalStreams = liveSellers.filter(s => s.id === profileData.uid).length;
  const isLive = liveSellers.some(s => s.id === profileData.uid);
  
  const handleSaveAdminNotes = async () => {
    try {
        await updateUserData(userId, { adminNotes });
        toast({ title: "Notes Saved", description: "Admin notes have been updated successfully." });
    } catch(err) {
        toast({ variant: 'destructive', title: "Save Failed", description: "Could not save admin notes." });
    }
  }

  const renderRevenueDetailView = () => {
        let title = '';
        let data: any[] = [];
        let columns: { key: string, label: string, type?: 'currency' | 'date' | 'badge' }[] = [];

        switch(revenueDetailView) {
            case 'earnings':
                title = 'Total Earnings Breakdown';
                data = userOrders.filter(o => getStatusFromTimeline(o.timeline) === 'Delivered');
                columns = [
                    { key: 'orderId', label: 'Order ID' },
                    { key: 'orderDate', label: 'Date', type: 'date' },
                    { key: 'total', label: 'Amount', type: 'currency' }
                ];
                break;
            case 'withdrawn':
                 title = 'Completed Payouts';
                 data = payouts.filter(p => p.status === 'paid');
                 columns = [
                    { key: 'payoutDate', label: 'Date Paid', type: 'date' },
                    { key: 'amount', label: 'Amount', type: 'currency' }
                 ];
                 break;
            case 'pending':
                title = 'Pending Payouts';
                data = payouts.filter(p => p.status === 'pending');
                columns = [
                    { key: 'requestedAt', label: 'Date Requested', type: 'date' },
                    { key: 'amount', label: 'Amount', type: 'currency' }
                ];
                break;
            default:
                return null;
        }
        
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRevenueDetailView(null)}>
                            <ArrowLeft className="h-4 w-4"/>
                        </Button>
                        <CardTitle>{title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? data.map((item, index) => (
                                <TableRow key={index}>
                                    {columns.map(col => (
                                        <TableCell key={col.key}>
                                            {col.type === 'currency' ? `₹${item[col.key].toLocaleString()}` :
                                             col.type === 'date' && item[col.key] ? format(item[col.key].toDate ? item[col.key].toDate() : new Date(item[col.key]), 'dd MMM, yyyy') :
                                             item[col.key]?.toString()}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={columns.length} className="text-center h-24">No data available.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )
  };


  const renderRevenueView = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="text-left w-full" onClick={() => setRevenueDetailView('earnings')}>
                <Card className="hover:bg-muted/50 transition-colors"><CardHeader><CardTitle>Total Earnings</CardTitle><CardDescription>Gross revenue from sales</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{sellerRevenueData.totalEarnings.toLocaleString()}</p></CardContent></Card>
            </button>
             <Card><CardHeader><CardTitle>Platform Commission</CardTitle><CardDescription>3% fee on earnings</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{sellerRevenueData.platformCommission.toLocaleString()}</p></CardContent></Card>
            <button className="text-left w-full" onClick={() => setRevenueDetailView('withdrawn')}>
                <Card className="hover:bg-muted/50 transition-colors"><CardHeader><CardTitle>Total Withdrawn</CardTitle><CardDescription>All completed payouts</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{sellerRevenueData.totalWithdrawn.toLocaleString()}</p></CardContent></Card>
            </button>
             <button className="text-left w-full" onClick={() => setRevenueDetailView('pending')}>
                <Card className="hover:bg-muted/50 transition-colors"><CardHeader><CardTitle>Pending Payouts</CardTitle><CardDescription>Awaiting admin approval</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">₹{sellerRevenueData.pendingPayouts.toLocaleString()}</p></CardContent></Card>
            </button>
        </div>

        {revenueDetailView ? renderRevenueDetailView() : (
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
        )}
    </div>
  );

  return (
    <main className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Dialog onOpenChange={(open) => !open && setSelectedOrderForTimeline(null)}>
            <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between gap-4">
                     <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Users
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight sm:grow-0">
                        User Profile
                    </h1>
                </div>
                <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-6 lg:col-span-1">
                        <Card>
                             <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={profileData.photoURL} />
                                            <AvatarFallback>{profileData.displayName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="flex items-center gap-2">{profileData.displayName}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{profileData.publicId || profileData.uid}</p>
                                        </div>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link href={`/admin/messages?userId=${profileData.uid}&userName=${profileData.displayName}`}>
                                            <MessageSquare className="mr-2 h-4 w-4" /> Message
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                             <CardContent className="space-y-3 text-sm">
                                <div className="font-semibold">Contact Information</div>
                                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {profileData.email}</div>
                                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {profileData.phone}</div>
                                
                                {profileData.addresses && profileData.addresses.length > 0 && (
                                    <div className="flex items-start gap-2 pt-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" /> 
                                        <address className="not-italic text-muted-foreground">
                                             {profileData.addresses[0].village}, {profileData.addresses[0].district}, {profileData.addresses[0].city}, {profileData.addresses[0].state} - {profileData.addresses[0].pincode}
                                        </address>
                                    </div>
                                )}
                                
                                <Separator className="my-3"/>
                                
                                <div className="flex items-center justify-between"><span>Role:</span> <Badge variant={profileData.role === 'admin' ? 'destructive' : profileData.role === 'seller' ? 'secondary' : 'outline'}>{profileData.role}</Badge></div>
                                <div className="flex items-center justify-between"><span>KYC:</span> <Badge variant={profileData.kycStatus === 'verified' ? 'success' : 'warning'}>{profileData.kycStatus || 'pending'}</Badge></div>
                                <div className="flex items-center justify-between"><span>Live Status:</span> {isLive ? <Badge variant="destructive" className="animate-pulse">LIVE</Badge> : <Badge variant="outline">Offline</Badge>}</div>
                                <div className="flex items-center justify-between"><span>Last Active:</span> <span>{profileData.lastLogin ? format(profileData.lastLogin.toDate(), 'dd MMM, p') : 'N/A'}</span></div>
                                <div className="flex items-center justify-between"><span>Joined:</span> <span>{profileData.createdAt ? format(profileData.createdAt.toDate(), 'dd MMM, yyyy') : 'N/A'}</span></div>
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
                                            <span className="text-muted-foreground">Total Streams</span>
                                            <span className="font-semibold">{totalStreams}</span>
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
                         <Card>
                            <CardHeader>
                                <CardTitle>Admin Controls</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="ban-user" className="flex flex-col space-y-1">
                                        <span>Ban User</span>
                                        <span className="font-normal leading-snug text-muted-foreground text-xs">
                                            Prevent this user from logging in.
                                        </span>
                                    </Label>
                                    <Switch id="ban-user" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="restrict-chat" className="flex flex-col space-y-1">
                                        <span>Restrict Chat Ability</span>
                                        <span className="font-normal leading-snug text-muted-foreground text-xs">
                                            Block this user from sending messages.
                                        </span>
                                    </Label>
                                    <Switch id="restrict-chat" />
                                </div>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="w-full">Remove Abusive Chat Messages</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Confirm Removal</AlertDialogTitle><AlertDialogDescription>This will permanently delete all chat messages sent by this user. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Confirm & Delete</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                 <div className="space-y-2 pt-2">
                                     <Label>Admin Notes</Label>
                                     <Textarea placeholder="Add private notes about this user..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
                                     <Button size="sm" onClick={handleSaveAdminNotes}>Save Notes</Button>
                                 </div>
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
