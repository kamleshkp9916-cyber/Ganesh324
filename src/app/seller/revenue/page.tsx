
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // TabsContent not used
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { ArrowLeft, Calendar as CalendarIcon, Download, Filter, TrendingUp, TrendingDown, RefreshCcw, CircleDollarSign, PackageCheck, Undo2, Wallet, Search, ChevronDown, Plus, ShoppingBag, Menu, Package2, CircleUser } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useAuthActions } from "@/lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


// ---------- Mock Data (replace with Firestore/API later) ----------
const revenueKPI = {
  totalRevenue: 45231.89,
  growthPct: 20.1,
  orderRevenue: 44881.89,
  otherCharges: 350.0,
  pendingPayout: 15231.0,
  withdrawn: 30000.0,
  avgOrderValue: 1950.0,
  totals: { orders: 230, delivered: 220, returns: 6, refunds: 4 },
  nextPayoutDate: new Date(2025, 10, 12), // 12 Nov 2025 (Month is 0-indexed)
};

const revenueSeriesMonthly = [
  { name: "Jan", revenue: 1200 },
  { name: "Feb", revenue: 1800 },
  { name: "Mar", revenue: 2600 },
  { name: "Apr", revenue: 3100 },
  { name: "May", revenue: 4800 },
  { name: "Jun", revenue: 5900 },
];

const topProducts = [
  { product: "Hoodie A", revenue: 22300, sales: 45, conv: 4.2 },
  { product: "T-Shirt B", revenue: 18900, sales: 64, conv: 5.6 },
  { product: "Cap C", revenue: 5020, sales: 37, conv: 3.9 },
];

const returnRefundSummary = [
  { type: "Return", count: 4, amount: 1200 },
  { type: "Refund", count: 2, amount: 650 },
];

const txns = [
  { id: "#ORD5896", type: "Order", gross: 12500, fees: -250, net: 12250, ts: new Date(2025, 9, 29) },
  { id: "#ORD5897", type: "Order", gross: 4999, fees: -100, net: 4899, ts: new Date(2025, 9, 30) },
  { id: "charge_123", type: "Shipping Fee", gross: 150, fees: -5, net: 145, ts: new Date(2025, 10, 2) },
  { id: "charge_456", type: "Convenience Fee", gross: 50, fees: -2, net: 48, ts: new Date(2025, 10, 3) },
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


  const handleChartTypeChange = (v: string) => {
    setChartType(v === "bar" ? "bar" : "area");
  };

  const filteredTxns = useMemo(() => {
    return txns.filter((t) => {
      const hay = (t.id + " " + t.type).toLowerCase();
      const matchesQ = query ? hay.includes(query.toLowerCase()) : true;
      const matchesType = typeFilter ? t.type === typeFilter : true;
      return matchesQ && matchesType;
    });
  }, [query, typeFilter]);

  const examplePaths = {
    revenueSummary: "shops/{sellerId}/revenueSummary",
    transactions: "shops/{sellerId}/transactions",
    products: "shops/{sellerId}/products",
    monthlyMetrics: "shops/{sellerId}/metrics/monthly/{YYYY-MM}",
    rules: "request.auth.uid == resource.data.sellerId",
    currency: "Intl.NumberFormat('en-IN',{ currency:'INR' })",
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
       <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/seller/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Package2 className="h-6 w-6" />
            <span className="sr-only">StreamCart Seller</span>
          </Link>
          <Link
            href="/seller/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
           <Link
            href="/seller/revenue"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Revenue
          </Link>
          <Link
            href="/seller/orders"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Orders
          </Link>
          <Link
            href="/seller/products"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Products
          </Link>
           <Link
            href="/seller/promotions"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Promotions
          </Link>
          <Link
            href="/seller/feed"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Feed
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Analytics
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">StreamCart</span>
              </Link>
              <Link href="/seller/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
               <Link href="/seller/revenue" className="hover:text-foreground">
                Revenue
              </Link>
              <Link
                href="/seller/orders"
                className="text-muted-foreground hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="/seller/products"
                className="text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="/seller/promotions"
                className="text-muted-foreground hover:text-foreground"
              >
                Promotions
              </Link>
               <Link
                href="/seller/feed"
                className="text-muted-foreground hover:text-foreground"
              >
                Feed
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Analytics
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            {/* Search can be added later if needed */}
          </form>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                   <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} alt={user.displayName || "User"} />
                      <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/setting')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut(true)}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
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
              <div className="text-2xl font-semibold">{inr(revenueKPI.totalRevenue)}</div>
              <div className={["mt-1","text-xs","flex","items-center","gap-1", pctColor(revenueKPI.growthPct)].join(" ")}>
                {pctIcon(revenueKPI.growthPct)} {revenueKPI.growthPct}% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Order Revenue</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold">{inr(revenueKPI.orderRevenue)}</div>
              <p className="text-xs text-muted-foreground">From product sales</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Other Charges</CardTitle>
              <Undo2 className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold">{inr(revenueKPI.otherCharges)}</div>
              <p className="text-xs text-muted-foreground">Shipping, fees, etc.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Payouts</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Pending</span>
                <span className="font-medium">{inr(revenueKPI.pendingPayout)}</span>
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
                  <AreaChart data={revenueSeriesMonthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                  <BarChart data={revenueSeriesMonthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                <span className="font-medium">{revenueKPI.totals.orders}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Delivered</span>
                <span>{revenueKPI.totals.delivered}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Average Order Value</span>
                <span>{inr(revenueKPI.avgOrderValue)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Returns</span>
                <span className="text-amber-600">{revenueKPI.totals.returns}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Refunds</span>
                <span className="text-amber-600">{revenueKPI.totals.refunds}</span>
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
                    <TableHead className="text-right">Conv%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p) => (
                    <TableRow key={p.product}>
                      <TableCell className="font-medium">{p.product}</TableCell>
                      <TableCell className="text-right">{inr(p.revenue)}</TableCell>
                      <TableCell className="text-right">{p.sales}</TableCell>
                      <TableCell className="text-right">{p.conv}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm order-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Returns & Refunds</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {returnRefundSummary.map((r) => (
                <div key={r.type} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Badge variant={r.type === "Return" ? "secondary" : "outline"}>{r.type}</Badge>
                  </span>
                  <span className="tabular-nums">{r.count} • {inr(r.amount)}</span>
                </div>
              ))}
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
                  <DropdownMenuItem onClick={() => setTypeFilter("Shipping Fee")}>Shipping Fee</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("Convenience Fee")}>Convenience Fee</DropdownMenuItem>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{t.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{inr(t.gross)}</TableCell>
                    <TableCell className="text-right">{inr(t.fees)}</TableCell>
                    <TableCell className="text-right font-medium">{inr(t.net)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{format(t.ts, "dd MMM yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-muted-foreground">Showing {filteredTxns.length} of {txns.length}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </CardFooter>
        </Card>

        {/* Developer Notes / Integration Hints */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Integration Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                Replace mock data with Firestore using a revenue collection:
                <span className="block mt-1"><code>{examplePaths.revenueSummary}</code></span>
                <span className="block"><code>{examplePaths.transactions}</code></span>
                <span className="block"><code>{examplePaths.products}</code></span>
              </li>
              <li>
                Compute KPIs via a Cloud Function on order write, store a denormalized monthly doc:
                <span className="block mt-1"><code>{examplePaths.monthlyMetrics}</code></span>
              </li>
              <li>
                Export CSV: build from <code>transactions</code> query and trigger a file download in the browser.
              </li>
              <li>
                Security: scope reads/writes with rules checking
                <span className="block mt-1"><code>{examplePaths.rules}</code></span>
              </li>
              <li>
                Currency: using
                <span className="block mt-1"><code>{examplePaths.currency}</code></span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

