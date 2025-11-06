
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { ArrowLeft, Calendar as CalendarIcon, Download, Filter, TrendingUp, TrendingDown, RefreshCcw, CircleDollarSign, PackageCheck, Undo2, Wallet, Search, ChevronDown, Plus, ShoppingBag, Menu, Package2, CircleUser, Loader2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import { format, differenceInDays, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useAuthActions } from "@/lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SellerHeader } from "@/components/seller/seller-header";
import { productDetails, productToSellerMapping } from "@/lib/product-data";
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { Order, getStatusFromTimeline } from '@/lib/order-data';


// ---------- Mock Data (to be fully replaced) ----------
const revenueKPI = {
  withdrawn: 30000.0,
  nextPayoutDate: new Date(2025, 10, 12), // 12 Nov 2025 (Month is 0-indexed)
};

const mockSellerOrdersForDisplay: Order[] = [
    {
        orderId: "#MOCK-001",
        userId: "mockCustomer1",
        products: [{ name: "Mock Product A", price: "1500.00", quantity: 1, key: "mock-a" }],
        address: {},
        total: 1500.00,
        orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [{ status: "Delivered", date: format(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), 'dd MMM yyyy'), time: "2:00 PM", completed: true }],
        isReturnable: true
    },
    {
        orderId: "#MOCK-002",
        userId: "mockCustomer2",
        products: [{ name: "Mock Product B", price: "3250.50", quantity: 2, key: "mock-b" }],
        address: {},
        total: 6501.00,
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [{ status: "Delivered", date: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'dd MMM yyyy'), time: "11:30 AM", completed: true }],
        isReturnable: true
    }
];

// ---------- Utilities (plain JS) ----------
const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
const pctColor = (n: number) => (n >= 0 ? "text-green-600" : "text-red-600");
const pctIcon = (n: number) => (n >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />);

// ---------- Component ----------
export default function SellerRevenueDashboard() {
  const [range, setRange] = useState("month"); // "month" | "week"
  const [chartType, setChartType] = useState("area"); // "area" | "bar"
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const router = useRouter();
  const { user, userData } = useAuth();
  const { signOut } = useAuthActions();
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellerOrders = async () => {
      if (!user || !userData) return;
      setIsLoading(true);
      const db = getFirestoreDb();
      let allOrders: Order[] = [];

      const sellerProductKeys = Object.entries(productToSellerMapping)
        .filter(([, sellerInfo]) => sellerInfo.uid === user.uid)
        .map(([key]) => key);

      if (sellerProductKeys.length === 0) {
        setSellerOrders(mockSellerOrdersForDisplay);
        setIsLoading(false);
        return;
      }
      
      const productChunks: string[][] = [];
      for (let i = 0; i < sellerProductKeys.length; i += 10) {
          productChunks.push(sellerProductKeys.slice(i, i + 10));
      }

      const ordersRef = collection(db, "orders");
      for (const chunk of productChunks) {
          const q = query(ordersRef, where("products.key", "in", chunk));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
              const orderData = doc.data() as Order;
              if(orderData.products.some(p => sellerProductKeys.includes(p.key))) {
                allOrders.push({ ...orderData, orderId: doc.id });
              }
          });
      }

      // Add mock data for demonstration if no real orders are found
      if(allOrders.length === 0) {
        allOrders.push(...mockSellerOrdersForDisplay);
      }

      setSellerOrders(allOrders);
      setIsLoading(false);
    };

    if (user && userData) {
      fetchSellerOrders();
    }
  }, [user, userData]);

  const PLATFORM_FEE_RATE = 0.05;

  const revenueInsights = useMemo(() => {
    if (isLoading) {
      return { 
        totalRevenue: 0,
        otherCharges: 0,
        orderRevenue: 0,
        growthPct: 0,
        transactions: [],
        withdrawablePayout: 0,
      };
    }
    const deliveredOrders = sellerOrders.filter(o => getStatusFromTimeline(o.timeline) === 'Delivered');

    let withdrawablePayout = 0;
    const now = new Date();

    deliveredOrders.forEach(order => {
        const deliveryStep = order.timeline.find(step => step.status === 'Delivered');
        if (deliveryStep && deliveryStep.date) {
            try {
                const deliveryDate = parseISO(order.orderDate); 
                if (differenceInDays(now, deliveryDate) > 7) {
                    const productTotal = order.products.reduce((prodSum, p) => prodSum + (parseFloat(p.price.replace(/[^0-9.-]+/g, '')) * p.quantity), 0);
                    withdrawablePayout += productTotal * (1 - PLATFORM_FEE_RATE);
                }
            } catch(e) {
                console.error("Could not parse order date for payout calculation", e);
            }
        }
    });

    const orderRevenue = deliveredOrders.reduce((sum, o) => {
      const productTotal = o.products.reduce((prodSum, p) => prodSum + (parseFloat(p.price.replace(/[^0-9.-]+/g, '')) * p.quantity), 0);
      return sum + productTotal;
    }, 0);

    const otherCharges = orderRevenue * PLATFORM_FEE_RATE;

    const transactions = deliveredOrders.map(order => {
        const gross = order.products.reduce((prodSum, p) => prodSum + (parseFloat(p.price.replace(/[^0-9.-]+/g, '')) * p.quantity), 0);
        const fees = gross * PLATFORM_FEE_RATE;
        return {
            id: order.orderId,
            type: "Order",
            productName: order.products.map(p => p.name).join(', '),
            gross: gross,
            fees: -fees,
            net: gross - fees,
            ts: new Date(order.orderDate)
        };
    });

    return {
      totalRevenue: orderRevenue - otherCharges,
      orderRevenue,
      otherCharges,
      growthPct: 20.1, // Mock growth
      transactions,
      withdrawablePayout,
    };
  }, [sellerOrders, isLoading]);

  const monthlyRevenueData = useMemo(() => {
    const months: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      months[monthKey] = 0;
    }

    if (!isLoading && sellerOrders.length > 0) {
      const deliveredOrders = sellerOrders.filter(o => getStatusFromTimeline(o.timeline) === 'Delivered');
      
      deliveredOrders.forEach(order => {
        const orderDate = new Date(order.orderDate);
        const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
        if (monthKey in months) {
          const productTotal = order.products.reduce((prodSum, p) => prodSum + (parseFloat(p.price.replace(/[^0-9.-]+/g, '')) * p.quantity), 0);
          const netRevenue = productTotal * (1 - PLATFORM_FEE_RATE);
          months[monthKey] += netRevenue;
        }
      });
    }

    return Object.entries(months).map(([key, revenue]) => {
      const [, monthIndex] = key.split('-').map(Number);
      return {
        name: monthNames[monthIndex],
        revenue: Math.round(revenue)
      };
    });
  }, [sellerOrders, isLoading]);


  const orderInsights = useMemo(() => {
    if (isLoading || sellerOrders.length === 0) {
      return { totalOrders: 0, delivered: 0, returnsAndRefunds: 0, avgOrderValue: 0, topSellingProducts: [] };
    }
    const totalOrders = sellerOrders.length;
    const deliveredOrders = sellerOrders.filter(o => getStatusFromTimeline(o.timeline) === 'Delivered');
    const returnsAndRefunds = sellerOrders.filter(o => {
        const status = getStatusFromTimeline(o.timeline);
        return status === 'Cancelled by user' || status === 'Cancelled by admin' || status === 'Returned';
    }).length;

    const totalSalesValue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = deliveredOrders.length > 0 ? totalSalesValue / deliveredOrders.length : 0;
    
    const topProductsData = deliveredOrders.reduce((acc, order) => {
        order.products.forEach(p => {
             acc[p.name] = (acc[p.name] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const topSellingProducts = Object.entries(topProductsData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, sales]) => {
            const productRevenue = deliveredOrders
                .flatMap(o => o.products)
                .filter(p => p.name === name)
                .reduce((sum, p) => sum + parseFloat(p.price.replace(/[^0-9.-]+/g, '')) * p.quantity, 0);
            return { product: name, revenue: productRevenue, sales };
        });

    return {
      totalOrders,
      delivered: deliveredOrders.length,
      returnsAndRefunds,
      avgOrderValue,
      topSellingProducts,
    };
  }, [sellerOrders, isLoading]);


  const handleChartTypeChange = (v: string) => {
    setChartType(v === "bar" ? "bar" : "area");
  };

  const filteredTxns = useMemo(() => {
    return revenueInsights.transactions.filter((t) => {
      const hay = (t.id + " " + t.type + " " + t.productName).toLowerCase();
      const matchesQ = query ? hay.includes(query.toLowerCase()) : true;
      const matchesType = typeFilter ? t.type === typeFilter : true;
      return matchesQ && matchesType;
    });
  }, [query, typeFilter, revenueInsights.transactions]);

  return (
    <div className="flex min-h-screen w-full flex-col">
       <SellerHeader />
      <main className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Revenue Details</h1>
            <p className="text-sm text-muted-foreground">Track revenue, payouts, and transaction health at a glance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><RefreshCcw className="h-4 w-4"/>Refresh</Button>
            <Button className="gap-2"><Download className="h-4 w-4"/>Export CSV</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold">{inr(revenueInsights.totalRevenue)}</div>
              <div className={["mt-1","text-xs","flex","items-center","gap-1", pctColor(revenueInsights.growthPct)].join(" ")}>
                {pctIcon(revenueInsights.growthPct)} {revenueInsights.growthPct}% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Order Revenue</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold">{inr(revenueInsights.orderRevenue)}</div>
              <p className="text-xs text-muted-foreground">From product sales</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Other Charges</CardTitle>
              <Undo2 className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold">{inr(revenueInsights.otherCharges)}</div>
              <p className="text-xs text-muted-foreground">{PLATFORM_FEE_RATE * 100}% platform fees</p>
            </CardContent>
          </Card>

          <Link href="/setting">
            <Card className="shadow-sm h-full hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Payouts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Withdrawable</span>
                  <span className="font-medium">{inr(revenueInsights.withdrawablePayout)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Withdrawn</span>
                  <span>{inr(revenueKPI.withdrawn)}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-xs text-muted-foreground w-full text-right">Next payout: {format(revenueKPI.nextPayoutDate, "dd MMM yyyy")}</p>
              </CardFooter>
            </Card>
          </Link>
        </div>

        {/* Graph + Controls */}
        <Card className="shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Revenue Over Time</CardTitle>
              <div className="flex items-center gap-2">
                <Tabs value={chartType} onValueChange={handleChartTypeChange}>
                  <TabsList>
                    <TabsTrigger value="area">Area</TabsTrigger>
                    <TabsTrigger value="bar">Bar</TabsTrigger>
                  </TabsList>
                </Tabs>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1"><CalendarIcon className="h-4 w-4"/>Last 6 months<ChevronDown className="h-4 w-4"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setRange("month")}>Monthly</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRange("week")}>Weekly</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => "₹" + v} />
                    <Tooltip formatter={(v) => inr(Number(v))} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#rev)" />
                  </AreaChart>
                ) : (
                  <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => "₹" + v} />
                    <Tooltip formatter={(v) => inr(Number(v))} />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Insights Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="shadow-sm order-2 xl:order-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Insights</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Total Orders</span>
                <span className="font-medium">{orderInsights.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Delivered</span>
                <span>{orderInsights.delivered}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Average Order Value</span>
                <span>{inr(orderInsights.avgOrderValue)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Returns & Refunds</span>
                <span className="text-amber-600">{orderInsights.returnsAndRefunds}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm order-1 xl:order-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderInsights.topSellingProducts.map((p) => (
                    <TableRow key={p.product}>
                      <TableCell className="font-medium">{p.product}</TableCell>
                      <TableCell className="text-right">{inr(p.revenue)}</TableCell>
                      <TableCell className="text-right">{p.sales}</TableCell>
                    </TableRow>
                  ))}
                   {orderInsights.topSellingProducts.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                        No delivered sales data yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {isLoading && (
                     <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm order-3">
             <CardHeader className="pb-2">
              <CardTitle className="text-base">Returns & Refunds</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                    <Badge variant="secondary">Returns</Badge>
                </span>
                <span className="tabular-nums">
                    {sellerOrders.filter(o => getStatusFromTimeline(o.timeline) === 'Returned').length} • {inr(sellerOrders.filter(o => getStatusFromTimeline(o.timeline) === 'Returned').reduce((sum, o) => sum + o.total, 0))}
                </span>
              </div>
               <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                    <Badge variant="outline">Refunds (Cancelled)</Badge>
                </span>
                <span className="tabular-nums">
                    {sellerOrders.filter(o => getStatusFromTimeline(o.timeline).toLowerCase().includes('cancelled')).length} • {inr(sellerOrders.filter(o => getStatusFromTimeline(o.timeline).toLowerCase().includes('cancelled')).reduce((sum, o) => sum + o.total, 0))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by ID or type" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Type</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTypeFilter(null)}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("Order")}>Order</DropdownMenuItem>
                  
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />Add Manual</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order/Transaction ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTxns.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.id}</TableCell>
                    <TableCell>{t.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{t.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{inr(t.gross)}</TableCell>
                    <TableCell className="text-right text-destructive">{inr(t.fees)}</TableCell>
                    <TableCell className="text-right font-medium">{inr(t.net)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{format(t.ts, "dd MMM yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-muted-foreground">Showing {filteredTxns.length} of {revenueInsights.transactions.length}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
