
"use client"

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  Sparkles,
  ShieldCheck,
  RadioTower,
  Ticket,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useAuthActions } from "@/lib/auth";
import { GoLiveDialog } from "@/components/go-live-dialog";
import { SellerHeader } from "@/components/seller/seller-header";
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase-db';
import { getStatusFromTimeline, Order } from '@/lib/order-data';


const SELLER_WELCOME_KEY = 'streamcart_seller_welcome_shown';

export default function SellerDashboard() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // This effect runs once when the component mounts and the user data is available.
    // It checks if the welcome dialog should be shown to a new seller.
    if (isMounted && !loading && userData?.role === 'seller') {
        const welcomeShown = localStorage.getItem(SELLER_WELCOME_KEY);
        if (!welcomeShown) {
            setShowWelcomeDialog(true);
            localStorage.setItem(SELLER_WELCOME_KEY, 'true');
        }
    }
  }, [userData, loading, isMounted]);

  useEffect(() => {
    const fetchSellerData = async () => {
        if (user?.uid) {
            setIsLoadingMetrics(true);
            const db = getFirestoreDb();
            const ordersRef = collection(db, "orders");
            const q = query(ordersRef, where("sellerId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const fetchedOrders = querySnapshot.docs.map(doc => doc.data() as Order);
            setSellerOrders(fetchedOrders);
            setIsLoadingMetrics(false);
        }
    };
    if (user) {
        fetchSellerData();
    }
  }, [user]);

  const deliveredOrders = useMemo(() => {
    return sellerOrders.filter(order => getStatusFromTimeline(order.timeline) === 'Delivered');
  }, [sellerOrders]);

  const totalRevenue = useMemo(() => {
    return deliveredOrders.reduce((acc, order) => acc + order.total, 0);
  }, [deliveredOrders]);

  const totalSales = useMemo(() => {
    return deliveredOrders.length;
  }, [deliveredOrders]);
  
  const recentSales = useMemo(() => {
    return deliveredOrders
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 5)
        .map(order => ({
            name: order.address.name,
            email: `Order: ${order.orderId}`, // Displaying order ID instead of email for privacy
            amount: `+${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.total)}`,
            avatar: "https://placehold.co/40x40.png" // Placeholder avatar
        }));
  }, [deliveredOrders]);
  
  const salesData = useMemo(() => {
    const months = Array(6).fill(0).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return { name: d.toLocaleString('default', { month: 'short' }), sales: 0, year: d.getFullYear(), month: d.getMonth() };
    }).reverse();

    deliveredOrders.forEach(order => {
        const orderDate = new Date(order.orderDate);
        const monthIndex = months.findIndex(m => m.year === orderDate.getFullYear() && m.month === orderDate.getMonth());
        if (monthIndex !== -1) {
            months[monthIndex].sales += order.total;
        }
    });

    return months.map(m => ({name: m.name, sales: Math.round(m.sales)}));
  }, [deliveredOrders]);

  if (!isMounted || loading || !user || !userData) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  // The AuthRedirector component handles redirection for non-sellers.
  // We can safely assume if this component renders, the user is a seller.

  return (
    <>
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary h-6 w-6" />
                    Welcome to Your Seller Dashboard!
                </DialogTitle>
                <DialogDescription className="pt-2">
                    Congratulations on becoming a StreamCart seller! Here are a few tips to get you started on the right foot.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
                <p><strong>1. List Your Products:</strong> Head over to the "Products" tab to start adding your inventory. Clear photos and detailed descriptions are key!</p>
                <p><strong>2. Go Live:</strong> Use live streams to showcase your products in real-time. Engage with your audience, answer their questions, and drive sales.</p>
                <p><strong>3. Fulfill Orders Promptly:</strong> Keep an eye on the "Orders" tab. Fast shipping and good communication lead to happy customers and great reviews.</p>
                <p><strong>4. Be Professional:</strong> Always be respectful and honest in your interactions. Your reputation is your most valuable asset.</p>
                <p>We're excited to have you here. Happy selling!</p>
            </div>
            <DialogFooter>
                <Button onClick={() => setShowWelcomeDialog(false)}>Let's Get Started</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    <div className="flex min-h-screen w-full flex-col">
      <SellerHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Link href="/seller/revenue">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground">
                  Based on all delivered orders.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sales
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalSales}</div>
              <p className="text-xs text-muted-foreground">
                Total delivered orders.
              </p>
            </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  You haven't streamed yet.
                </p>
              </CardContent>
            </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Followers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{userData.followers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total followers on your profile.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                Your sales revenue over the last 6 months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMetrics ? <div className="h-[300px] flex items-center justify-center"><LoadingSpinner /></div> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)} />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                Your most recent completed sales.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
               {recentSales.length > 0 ? recentSales.map((sale, index) => (
                <div key={index} className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src={sale.avatar} alt="Avatar" />
                    <AvatarFallback>{sale.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{sale.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {sale.email}
                    </p>
                    </div>
                    <div className="ml-auto font-medium">{sale.amount}</div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-10">No recent sales to display.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </>
  )
}
