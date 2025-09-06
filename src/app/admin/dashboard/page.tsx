
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
  Video
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
  LineChart,
  Line,
} from "recharts"
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useAuthActions } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";


const salesData = [
  { name: "Jan", sales: 400000 },
  { name: "Feb", sales: 300000 },
  { name: "Mar", sales: 500000 },
  { name: "Apr", sales: 450000 },
  { name: "May", sales: 600000 },
  { name: "Jun", sales: 550000 },
]

const recentTransactionsData = [
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

const mockLiveStreams = [
    { id: 1, seller: { name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png' }, product: { name: 'Vintage Camera', imageUrl: 'https://placehold.co/80x80.png', hint: 'vintage camera' }, viewers: 1200, streamId: '1' },
    { id: 2, seller: { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png' }, product: { name: 'Wireless Headphones', imageUrl: 'https://placehold.co/80x80.png', hint: 'headphones' }, viewers: 2500, streamId: '2' },
    { id: 3, seller: { name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png' }, product: { name: 'Skincare Set', imageUrl: 'https://placehold.co/80x80.png', hint: 'skincare' }, viewers: 3100, streamId: '4' },
];


export default function AdminDashboard() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredTransactions = useMemo(() => {
    return recentTransactionsData.filter(transaction =>
      transaction.customer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      transaction.customer.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm]);

  // The AuthRedirector now handles all unauthorized access and loading states.
  // This page can assume that if it renders, the user is a verified admin.
  
  if (loading || !userData || userData.role !== 'admin') {
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
                className="text-muted-foreground hover:text-foreground"
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
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <span className="h-4 w-4 text-muted-foreground">₹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹1,24,52,31.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
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
                           {formatDistanceToNow(transaction.date, { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">₹{transaction.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle>Active Live Streams</CardTitle>
               <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/admin/live-control">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
               <Table>
                 <TableHeader>
                    <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead className="text-right">Viewers</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {mockLiveStreams.map((stream) => (
                        <TableRow key={stream.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={stream.seller.avatarUrl} />
                                        <AvatarFallback>{stream.seller.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{stream.seller.name}</div>
                                        <div className="text-sm text-muted-foreground">{stream.product.name}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant="secondary" className="gap-1.5">
                                    <Users className="h-3 w-3"/>
                                    {stream.viewers}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                 </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
