
"use client"

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package,
  Package2,
  Repeat,
  Search,
  Users,
  ListFilter,
  Video,
  MessageSquare,
} from "lucide-react"
import { useEffect, useState, useMemo } from "react";

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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useAuthActions } from "@/lib/auth";
import { Product } from "@/components/seller/product-form";
import { useToast } from "@/hooks/use-toast";

const salesData = [
  { name: "Jan", sales: 400000 },
  { name: "Feb", sales: 300000 },
  { name: "Mar", sales: 500000 },
  { name: "Apr", sales: 450000 },
  { name: "May", sales: 600000 },
  { name: "Jun", sales: 550000 },
]

const recentTransactions = [
    {
        orderId: "#ORD5896",
        customer: { name: "Ganesh Prajapati", email: "ganesh@example.com" },
        status: "Fulfilled",
        total: 12500.00,
        type: "Listed Product",
        date: new Date(),
    },
    {
        orderId: "#ORD5897",
        customer: { name: "Jane Doe", email: "jane.d@example.com" },
        status: "Fulfilled",
        total: 4999.00,
        type: "Live Stream",
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    {
        orderId: "#ORD5902",
        customer: { name: "David Garcia", email: "david.g@example.com" },
        status: "Processing",
        total: 3200.00,
        type: "Live Stream",
        date: new Date(new Date().setDate(new Date().getDate() - 3)),
    },
     {
        orderId: "#ORD5905",
        customer: { name: "Peter Jones", email: "peter.j@example.com" },
        status: "Pending",
        total: 7800.00,
        type: "Listed Product",
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
    },
    {
        orderId: "#ORD5903",
        customer: { name: "Jessica Rodriguez", email: "jessica.r@example.com" },
        status: "Cancelled",
        total: 4500.00,
        type: "Listed Product",
        date: new Date(new Date().setDate(new Date().getDate() - 10)),
    }
];

type FilterType = "all" | "stream" | "product";
type DateFilterType = "month" | "week" | "today";

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [sellerDetails, setSellerDetails] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("month");
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        const sellerDetailsRaw = localStorage.getItem('sellerDetails');
        if (!sellerDetailsRaw) {
            router.push('/seller/register');
        } else {
            const details = JSON.parse(sellerDetailsRaw);
            setSellerDetails(details);
            if (details.verificationStatus === 'pending') {
                details.verificationStatus = 'verified';
                localStorage.setItem('sellerDetails', JSON.stringify(details));
            }
        }
    }
  }, [router]);
  
  const filteredTransactions = useMemo(() => {
    let items = recentTransactions.filter(t => t.status !== 'Cancelled');
    
    if (typeFilter === 'stream') {
        items = items.filter(t => t.type === 'Live Stream');
    } else if (typeFilter === 'product') {
        items = items.filter(t => t.type === 'Listed Product');
    }

    const now = new Date();
    if (dateFilter === 'today') {
        items = items.filter(t => t.date.toDateString() === now.toDateString());
    } else if (dateFilter === 'week') {
        const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        items = items.filter(t => t.date > lastWeek);
    } else if (dateFilter === 'month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        items = items.filter(t => t.date > lastMonth);
    }

    return items;
  }, [typeFilter, dateFilter]);
  
  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => acc + curr.total, 0);
  }, [filteredTransactions]);

  if (!isMounted || loading || (isMounted && !sellerDetails)) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  if (!user) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">Please log in to view the seller dashboard.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
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
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
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
            href="/seller/messages"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Messages
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
                href="/seller/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">StreamCart</span>
              </Link>
              <Link href="/seller/dashboard" className="hover:text-foreground">
                Dashboard
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
                href="/seller/messages"
                className="text-muted-foreground hover:text-foreground"
              >
                Messages
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
          <Button variant="outline" size="sm" className="ml-auto">
             <Video className="h-4 w-4 mr-2" />
            Go Live
          </Button>
          <form className="flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} alt={user.displayName || "User"} />
                    <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : 'U'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                    </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem onSelect={() => router.push('/seller/profile')}>
                <CircleUser className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/setting')}>
                <CircleUser className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <span className="text-sm text-muted-foreground">₹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹4,52,31,890</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sales
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Live Streams</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+152</div>
              <p className="text-xs text-muted-foreground">
                since account creation
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
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card className="lg:col-span-2">
                <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                    An overview of your sales performance.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Legend />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>An overview of your most recent sales.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="capitalize">{typeFilter}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setTypeFilter('all')}>All</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setTypeFilter('stream')}>Live Stream</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setTypeFilter('product')}>Listed Product</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="capitalize">{dateFilter === 'month' ? 'This Month' : dateFilter === 'week' ? 'This Week' : 'Today'}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDateFilter('month')}>This Month</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setDateFilter('week')}>This Week</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setDateFilter('today')}>Today</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredTransactions.length > 0 ? filteredTransactions.map((transaction, index) => (
                        <TableRow key={index}>
                        <TableCell>
                            <div className="font-medium">{transaction.customer.name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                            <Badge variant={transaction.type === 'Live Stream' ? "destructive" : "secondary"} className="mr-2">{transaction.type}</Badge>
                            <Badge variant={transaction.status === 'Fulfilled' ? "success" : transaction.status === 'Cancelled' ? 'destructive' : "outline"} className="capitalize">{transaction.status}</Badge>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">{'₹' + transaction.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                                No transactions found for the selected filters.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
                    <div className="font-semibold">Total Revenue</div>
                    <div className="font-bold text-lg text-primary">{'₹' + totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </CardFooter>
            </Card>
        </div>
      </main>
    </div>
  )
}
