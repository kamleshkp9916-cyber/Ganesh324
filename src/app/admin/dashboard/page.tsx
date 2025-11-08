
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
  Search,
  Users,
  LineChart as LineChartIcon,
  ShieldCheck,
  RadioTower,
  Video,
  MoreHorizontal,
  Calendar as CalendarIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
  LineChart,
  Line,
} from "recharts"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useAuthActions } from "@/lib/auth";
import { formatDistanceToNow, isSameDay, isSameMonth, isSameYear, parseISO } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";
import { getFirestore, collection, query, getDocs, orderBy } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";


const salesData = [
  { name: "Jan", sales: 400000 },
  { name: "Feb", sales: 300000 },
  { name: "Mar", sales: 500000 },
  { name: "Apr", sales: 450000 },
  { name: "May", sales: 600000 },
  { name: "Jun", sales: 550000 },
]

const newAccountsData = [
  { name: "Jan", accounts: 120 },
  { name: "Feb", accounts: 180 },
  { name: "Mar", accounts: 250 },
  { name: "Apr", accounts: 210 },
  { name: "May", accounts: 320 },
  { name: "Jun", accounts: 450 },
];

type Order = {
    orderId: string;
    userId: string;
    products: any[];
    address: any;
    total: number;
    orderDate: string;
    timeline: any[];
};


const recentTransactionsData = [
    {
        orderId: "#ORD5896",
        customer: { name: "Ganesh Prajapati", email: "ganesh@example.com" },
        status: "Fulfilled",
        total: 12500.00,
        type: "Listed Product",
        date: "2024-07-29T10:00:00.000Z",
    },
    {
        orderId: "#ORD5897",
        customer: { name: "Jane Doe", email: "jane.d@example.com" },
        status: "Fulfilled",
        total: 4999.00,
        type: "Live Stream",
        date: "2024-07-28T12:30:00.000Z",
    },
    {
        orderId: "#ORD5902",
        customer: { name: "David Garcia", email: "david.g@example.com" },
        status: "Processing",
        total: 3200.00,
        type: "Live Stream",
        date: "2024-07-26T18:00:00.000Z",
    },
     {
        orderId: "#ORD5905",
        customer: { name: "Peter Jones", email: "peter.j@example.com" },
        status: "Pending",
        total: 7800.00,
        type: "Listed Product",
        date: "2024-07-24T09:15:00.000Z",
    },
    {
        orderId: "#ORD5903",
        customer: { name: "Jessica Rodriguez", email: "jessica.r@example.com" },
        status: "Cancelled",
        total: 4500.00,
        type: "Listed Product",
        date: "2024-07-19T11:45:00.000Z",
    }
];

const recentSales = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    avatar: "https://placehold.co/40x40.png"
  },
]


export default function AdminDashboard() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [salesFilter, setSalesFilter] = useState("This Month");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [accountsFilter, setAccountsFilter] = useState("Last 6 Months");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
        if (!loading && userData?.role === 'admin') {
            const db = getFirestoreDb();
            const ordersRef = collection(db, "orders");
            const q = query(ordersRef, orderBy("orderDate", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedOrders: Order[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                orderId: doc.id
            } as Order));
            setAllOrders(fetchedOrders);
        }
    };
    fetchOrders();
  }, [loading, userData]);


  const filteredTransactions = useMemo(() => {
    return recentTransactionsData.filter(transaction =>
      transaction.customer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      transaction.customer.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm]);

  const totalRevenue = useMemo(() => {
    return allOrders.reduce((acc, order) => acc + order.total, 0);
  }, [allOrders]);

  const salesFigures = useMemo(() => {
    if (!isMounted) return { sales: '+0', percent: '+0%' }; // Return default value on server
    
    const now = new Date();
    let filteredOrders = allOrders;

    switch (salesFilter) {
      case 'Today':
        filteredOrders = allOrders.filter(order => {
            try { return isSameDay(parseISO(order.orderDate), now) } catch { return false }
        });
        break;
      case 'This Month':
        filteredOrders = allOrders.filter(order => {
            try { return isSameMonth(parseISO(order.orderDate), now) } catch { return false }
        });
        break;
      case 'This Year':
        filteredOrders = allOrders.filter(order => {
            try { return isSameYear(parseISO(order.orderDate), now) } catch { return false }
        });
        break;
      case 'Custom Range':
        // Custom range logic would go here
        break;
      default:
        break;
    }
    
    // For now, we only show the count. The percentage can be a future enhancement.
    return {
      sales: `+${filteredOrders.length}`,
      percent: "+0%" // Placeholder
    };
  }, [salesFilter, allOrders, isMounted]);
  
  if (loading || !userData || userData.role !== 'admin' || !isMounted) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  const handleAdminSignOut = () => {
    signOut();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <ShieldCheck className="h-6 w-6" />
            <span className="sr-only">StreamCart Admin</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Orders
          </Link>
          <Link
            href="/admin/users"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Users
          </Link>
          <Link
            href="/admin/kyc"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            KYC
          </Link>
          <Link
            href="/admin/inquiries"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Inquiries
          </Link>
          <Link
            href="/admin/messages"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Messages
          </Link>
          <Link
            href="/admin/products"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Products
          </Link>
           <Link
            href="/admin/live-control"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Live Control
          </Link>
          <Link
            href="/admin/settings"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Settings
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
            <SheetHeader>
                <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <ShieldCheck className="h-6 w-6" />
                <span className="">Admin Panel</span>
              </Link>
              <Link href="/admin/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="/admin/orders"
                className="text-muted-foreground hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="/admin/users"
                className="text-muted-foreground hover:text-foreground"
              >
                Users
              </Link>
              <Link
                href="/admin/kyc"
                className="text-muted-foreground hover:text-foreground"
              >
                KYC
              </Link>
              <Link
                href="/admin/inquiries"
                className="text-muted-foreground hover:text-foreground"
              >
                Inquiries
              </Link>
              <Link
                href="/admin/messages"
                className="text-muted-foreground hover:text-foreground"
              >
                Messages
              </Link>
               <Link
                href="/admin/products"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="/admin/live-control"
                className="text-muted-foreground hover:text-foreground"
              >
                Live Control
              </Link>
              <Link
                href="/admin/settings"
                className="text-muted-foreground hover:text-foreground"
              >
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} alt={user.displayName || "Admin"} />
                    <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : 'A'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAdminSignOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <span className="h-4 w-4 text-muted-foreground">₹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex flex-col">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <CardDescription className="text-xs">{salesFilter}</CardDescription>
              </div>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setSalesFilter("Today")}>Today</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSalesFilter("This Month")}>This Month</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSalesFilter("This Year")}>This Year</DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Custom Range
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <p className="p-2 text-xs text-muted-foreground">Custom date range picker coming soon.</p>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesFigures.sales}</div>
              <p className="text-xs text-muted-foreground">
                {salesFigures.percent} from last period
              </p>
            </CardContent>
          </Card>
          <Link href="/admin/live-control">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
                <RadioTower className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/admin/orders">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Type
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.orderId}>
                        <TableCell>
                            <div className="font-medium">{transaction.customer.name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                                {transaction.customer.email}
                            </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                            <Badge variant={transaction.type === 'Live Stream' ? 'destructive' : 'secondary'} className="text-xs">
                                {transaction.type}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                             <Badge variant="outline">{transaction.status}</Badge>
                        </TableCell>
                         <TableCell className="hidden md:table-cell lg:hidden xl:table-cell">
                           {formatDistanceToNow(parseISO(transaction.date), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">₹{transaction.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                You made 265 sales this month.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
               {recentSales.map((sale, index) => (
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
              ))}
            </CardContent>
          </Card>
        </div>
         <Card className="col-span-1 lg:col-span-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                  <div>
                      <CardTitle>New Accounts Overview</CardTitle>
                      <CardDescription>Showing new user sign-ups for the {accountsFilter.toLowerCase()}.</CardDescription>
                  </div>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setAccountsFilter("Today")}>Today</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setAccountsFilter("This Month")}>This Month</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setAccountsFilter("Last 6 Months")}>Last 6 Months</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setAccountsFilter("This Year")}>This Year</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={newAccountsData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="accounts" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </main>
    </div>
  )
}
