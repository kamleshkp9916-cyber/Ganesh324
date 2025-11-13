
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
  AlertTriangle,
  Eye,
  ShoppingCart,
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
import { AdminLayout } from "@/components/admin/admin-layout";

type Order = {
    orderId: string;
    userId: string;
    products: any[];
    address: any;
    total: number;
    orderDate: string;
    timeline: any[];
};

const newAccountsData = [
  { name: "Jan", accounts: 120 },
  { name: "Feb", accounts: 180 },
  { name: "Mar", accounts: 250 },
  { name: "Apr", accounts: 210 },
  { name: "May", accounts: 320 },
  { name: "Jun", accounts: 450 },
];

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

const MetricCard = ({ title, value, description, icon: Icon, change, changeType }: { title: string, value: string, description: string, icon: React.ElementType, change?: string, changeType?: 'increase' | 'decrease' }) => (
    <Card>
        <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="p-1.5 bg-primary/10 rounded-full text-primary">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function AdminDashboard() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h2 className="text-2xl font-bold tracking-tight">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <MetricCard title="Total Sales Today" value="₹1,25,840" description="Helps you track daily growth" icon={DollarSign} />
          <MetricCard title="Total Orders Today" value="342" description="Quick view of order volume" icon={ShoppingCart} />
          <MetricCard title="Users Registered Today" value="18" description="Shows new user onboarding speed" icon={Users} />
          <MetricCard title="Active Live Streams" value="23" description="How many sellers are currently live" icon={RadioTower} />
          <MetricCard title="Peak Live Viewers Today" value="8,432" description="Shows traffic & engagement peak" icon={Activity} />
          <MetricCard title="Products Sold Today" value="512" description="Useful to track busiest product categories" icon={Package} />
          <MetricCard title="Failed Transactions Today" value="12" description="Helps you fix payment issues instantly" icon={AlertTriangle} />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/admin/transactions">
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
    </AdminLayout>
  )
}

    