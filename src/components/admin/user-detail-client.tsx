
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
  Star,
  User,
  UserCheck,
  UserX,
  Wallet,
  BookUser,
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
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getUserData, UserData, updateUserData } from "@/lib/follow-data";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { getStatusFromTimeline } from "@/lib/order-data";
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type Order = {
    orderId: string;
    userId: string;
    products: any[];
    address: any;
    total: number;
    orderDate: string;
    isReturnable: boolean;
    timeline: any[];
    paymentMethod: 'Credit Card' | 'UPI' | 'Net Banking';
    refundStatus: 'N/A' | 'Pending' | 'Completed';
    transactionId: string;
};

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
    {
        orderId: "#MOCK456",
        userId: "mockUser",
        products: [{ name: "Mock Product 2", key: "mock_2", productId: "mock_2" }],
        address: { name: "Mock User", village: "123 Mockingbird Lane", city: "Faketown", state: "CA", pincode: "90210", phone: "1234567890" },
        total: 450.50,
        orderDate: "2024-07-25T15:30:00.000Z",
        isReturnable: false,
        timeline: [{ status: "Shipped", date: "Jul 26, 2024", time: "11:00 AM", completed: true }],
        paymentMethod: 'UPI',
        refundStatus: 'Pending',
        transactionId: 'txn_7g8h9i0j1k2l'
    }
];

const mockProducts: Product[] = [
    { id: 'mock_1', key: 'mock_1', name: 'Mock Seller Product A', price: 1999.00, category: 'Electronics', images: [{ preview: 'https://placehold.co/100x100.png' }] },
    { id: 'mock_2', key: 'mock_2', name: 'Mock Seller Product B', price: 450.50, category: 'Fashion', images: [{ preview: 'https://placehold.co/100x100.png' }] },
];


export const UserDetailClient = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const { user: adminUser, userData: adminUserData, loading: adminLoading } = useAuth();
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('orders');
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState<Order | null>(null);
  const { toast } = useToast();

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
            setUserOrders(fetchedOrders.length > 0 ? fetchedOrders : mockOrders);

            // Fetch user products if they are a seller
            if (fetchedUserData.role === 'seller') {
                const productsKey = `sellerProducts_${fetchedUserData.displayName}`;
                const storedProducts = localStorage.getItem(productsKey);
                if (storedProducts && JSON.parse(storedProducts).length > 0) {
                    setUserProducts(JSON.parse(storedProducts));
                } else {
                     setUserProducts(mockProducts);
                }
            }

        } catch (error) {
            console.error("Error fetching user details:", error);
            // Fallback to mock data on error for demo purposes
            setUserOrders(mockOrders);
            setUserProducts(mockProducts);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchAllData();
  }, [userId]);
  
  const handleMakeAdmin = async () => {
    if (!profileData) return;
    
    await updateUserData(profileData.uid, { role: 'admin' });
    setProfileData(prev => prev ? { ...prev, role: 'admin' } : null);

    toast({
        title: "Success!",
        description: `${profileData.displayName} is now an administrator.`
    });
  };

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
  const sellerAverageRating = 4.8; // Mock rating

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes("pending")) return <Hourglass className="h-5 w-5" />;
    if (status.toLowerCase().includes("confirmed")) return <PackageOpen className="h-5 w-5" />;
    if (status.toLowerCase().includes("packed")) return <Package className="h-5 w-5" />;
    if (status.toLowerCase().includes("dispatch")) return <PackageCheck className="h-5 w-5" />;
    if (status.toLowerCase().includes("shipped")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("in transit")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("out for delivery")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("delivered")) return <Home className="h-5 w-5" />;
    if (status.toLowerCase().includes('cancelled') || status.toLowerCase().includes('undelivered') || status.toLowerCase().includes('failed delivery attempt') || status.toLowerCase().includes('return')) return <XCircle className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
  };

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
                                    <TableHead>Transaction Details</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <>
                                        <TableRow><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                                        <TableRow><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                                    </>
                                ) : userOrders.length > 0 ? (
                                    userOrders.map(order => (
                                        <TableRow key={order.orderId}>
                                            <TableCell>
                                                <Link href={`/delivery-information/${encodeURIComponent(order.orderId)}`} className="font-medium hover:underline">{order.orderId}</Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/product/${order.products[0].key}`} className="hover:underline">
                                                    {order.products[0].name}{order.products.length > 1 ? ` + ${order.products.length - 1}` : ''}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <DialogTrigger asChild>
                                                    <Badge 
                                                        variant={getStatusFromTimeline(order.timeline) === 'Delivered' ? 'success' : 'outline'}
                                                        className="cursor-pointer"
                                                        onClick={() => setSelectedOrderForTimeline(order)}
                                                    >
                                                        {getStatusFromTimeline(order.timeline)}
                                                    </Badge>
                                                </DialogTrigger>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <p>Pay: {order.paymentMethod}</p>
                                                <p>Refund: {order.refundStatus}</p>
                                                <p className="font-mono text-muted-foreground truncate" title={order.transactionId}>ID: {order.transactionId}</p>
                                            </TableCell>
                                            <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No orders found.</TableCell>
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
                                            <TableCell className="font-medium">
                                                <Link href={`/product/${product.key}`} className="hover:underline">{product.name}</Link>
                                            </TableCell>
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
    <Dialog onOpenChange={(open) => !open && setSelectedOrderForTimeline(null)}>
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
                <Button variant="outline" asChild>
                    <Link href={`/admin/messages?userId=${profileData.uid}&userName=${profileData.displayName}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                    </Link>
                </Button>
                 {profileData.role !== 'admin' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Make Admin
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Admin Promotion</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to grant administrator privileges to {profileData.displayName}? This action is irreversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleMakeAdmin}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
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
                                    <span className="text-xs text-muted-foreground">Total Orders</span>
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
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Order Timeline for {selectedOrderForTimeline?.orderId}</DialogTitle>
                <DialogDescription>
                   Review the step-by-step progress of this order from confirmation to delivery.
                </DialogDescription>
            </DialogHeader>
            <div className="p-4">
                 <ul className="space-y-2">
                    {selectedOrderForTimeline?.timeline.map((item: any, index: number) => (
                        <li key={index} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 z-10",
                                    item.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {item.completed ? <CheckCircle2 className="h-5 w-5" /> : getStatusIcon(item.status) }
                                </div>
                                {index < selectedOrderForTimeline.timeline.length - 1 && (
                                    <div className="w-0.5 h-10 bg-border" />
                                )}
                            </div>
                            <div className="flex-grow pt-1">
                                <p className={cn("font-semibold", !item.completed && "text-muted-foreground")}>
                                    {item.status.split(':')[0]}
                                </p>
                                {index === selectedOrderForTimeline.timeline.length - 1 && item.status.includes(':') && (
                                    <p className="text-sm text-muted-foreground">
                                        {item.status.split(':').slice(1).join(':').trim()}
                                    </p>
                                )}
                                {item.date && (
                                    <p className="text-sm text-muted-foreground">
                                        {item.date} {item.time && `- ${item.time}`}
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </DialogContent>
    </div>
    </Dialog>
  );
};

    