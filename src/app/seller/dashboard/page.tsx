
"use client"

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Repeat,
  Search,
  Users,
  ListFilter,
  Video,
  MessageSquare,
  Bell,
  RadioTower,
  LogOut,
  Send
} from "lucide-react"
import { useEffect, useState, useMemo } from "react";
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
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Dot
} from "recharts"
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useAuthActions } from "@/lib/auth";

const overviewData = [
    { name: "Jan", value: 65000 },
    { name: "Feb", value: 58000 },
    { name: "Mar", value: 72000 },
    { name: "Apr", value: 61000 },
    { name: "May", value: 80000 },
    { name: "Jun", value: 75000 },
    { name: "Jul", value: 85000 },
    { name: "Aug", value: 92000 },
    { name: "Sep", value: 88000 },
    { name: "Oct", value: 95000 },
    { name: "Nov", value: 98000 },
    { name: "Dec", value: 105000 },
];

const transactions = [
    { name: 'Alna_M', id: '323133', amount: '+$3430', status: 'Pending', date: '22/03/23', payment: { type: 'mastercard', last4: '3010' } },
    { name: 'Jason_A', id: '134325', amount: '+$200', status: 'Completed', date: '19/03/23', payment: { type: 'visa', last4: '4026' } },
    { name: 'Alex_D', id: '433229', amount: '+$421', status: 'Canceled', date: '15/03/23', payment: { type: 'amex', last4: '5400' } },
    { name: 'Milan_K', id: '632132', amount: '+$1200', status: 'Completed', date: '12/03/23', payment: { type: 'discover', last4: '4322' } },
];

const paymentIcons: { [key: string]: string } = {
    mastercard: 'https://placehold.co/24x24/FF5F00/FFFFFF/png?text=M',
    visa: 'https://placehold.co/24x24/1A1F71/FFFFFF/png?text=V',
    amex: 'https://placehold.co/24x24/2676C2/FFFFFF/png?text=A',
    discover: 'https://placehold.co/24x24/FF6C00/FFFFFF/png?text=D',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-2">
        <p className="font-bold text-lg">{`$${payload[0].value.toLocaleString()}`}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    );
  }
  return null;
};


export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  if (!user) {
     router.push('/seller/login');
     return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-card p-4 flex-col justify-between hidden md:flex">
          <div>
            <div className="mb-10">
                <h1 className="text-2xl font-bold">OFSPACE</h1>
            </div>
            <nav className="space-y-2">
                <Link href="#" className="flex items-center gap-3 bg-primary text-primary-foreground rounded-lg px-4 py-2 font-semibold">
                    <LayoutDashboard />
                    Dashboard
                </Link>
                <Link href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground rounded-lg px-4 py-2">
                    <CreditCard />
                    Cards
                </Link>
                <Link href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground rounded-lg px-4 py-2">
                    <Send />
                    Payments
                </Link>
                <Link href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground rounded-lg px-4 py-2">
                    <Activity />
                    Statistics
                </Link>
                 <Link href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground rounded-lg px-4 py-2">
                    <Repeat />
                    Transactions
                </Link>
                 <Link href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground rounded-lg px-4 py-2">
                    <Settings />
                    Settings
                </Link>
            </nav>
          </div>
           <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                    <Image src="https://placehold.co/150x100.png?text=Illustration" width={150} height={100} alt="illustration" className="mx-auto mb-2" data-ai-hint="office illustration"/>
                </div>
                 <Button variant="ghost" className="w-full justify-start gap-3" onClick={signOut}>
                    <LogOut />
                    Log out
                </Button>
           </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
          <header className="p-4 flex justify-between items-center w-full">
               <h1 className="text-2xl font-bold">Dashboard</h1>
               <div className="relative w-full max-w-xs">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input placeholder="Search" className="pl-10" />
               </div>
          </header>
          <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">$2,502.00</p>
                            <p className="text-xs text-muted-foreground">45 Transaction <span className="text-green-500 float-right">+12%</span></p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Spending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">$1,143.00</p>
                            <p className="text-xs text-muted-foreground">12 Transaction <span className="text-red-500 float-right">-4%</span></p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-sm font-medium text-muted-foreground">Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-12">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[{v:0},{v:2},{v:1},{v:3},{v:2},{v:5}]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#activityGradient)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-muted-foreground">Total Profit: $12,342</p>
                        </CardContent>
                    </Card>
                </div>
                 {/* Overview Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={overviewData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                               <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorUv)" activeDot={{ r: 8, style: { fill: 'hsl(var(--primary))' } }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                 {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Payment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://placehold.co/40x40.png?text=${t.name.charAt(0)}`} />
                                                <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {t.name}
                                        </TableCell>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell className="font-semibold">{t.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Canceled' ? 'destructive' : 'warning'}>
                                                {t.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{t.date}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <Image src={paymentIcons[t.payment.type]} alt={t.payment.type} width={24} height={24} />
                                            **** {t.payment.last4}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
              </div>

              {/* Right Panel */}
              <aside className="space-y-6">
                <header className="flex items-center justify-end gap-4">
                    <Button variant="ghost" size="icon">
                        <Bell />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png?text=${user.displayName?.charAt(0)}`} />
                                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {user.displayName}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={signOut}>Log Out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">$23,240,000</p>
                             <div className="grid grid-cols-2 gap-4 mt-4">
                                <Button>
                                    <Send className="mr-2 h-4 w-4" /> Send
                                </Button>
                                <Button variant="secondary">
                                    Withdraw
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Cards</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-primary text-primary-foreground p-4 rounded-lg relative overflow-hidden">
                                 <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full"></div>
                                <div className="absolute -left-12 bottom-2 w-32 h-32 bg-white/10 rounded-full"></div>
                                <p className="text-lg font-mono tracking-widest">6375 8456 9825 7546</p>
                                <div className="flex justify-between items-end mt-4">
                                    <div>
                                        <p className="text-xs">Name</p>
                                        <p className="font-semibold">{user.displayName}</p>
                                    </div>
                                     <div>
                                        <p className="text-xs">Exp Date</p>
                                        <p className="font-semibold">08/28</p>
                                    </div>
                                    <Image src={paymentIcons['mastercard']} alt="mastercard" width={32} height={32} />
                                </div>
                            </div>
                            <div className="border rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                     <Image src={paymentIcons['visa']} alt="visa" width={24} height={24} />
                                     <p className="font-mono text-sm">**** 6789</p>
                                </div>
                                <Button variant="ghost" size="sm">View</Button>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Send Money</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="recipient">Recipient Name</Label>
                                <Input id="recipient" placeholder="Royal Pervej" />
                            </div>
                            <div className="flex gap-2">
                               <div className="flex-1">
                                  <Label htmlFor="amount">Amount</Label>
                                   <div className="flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-24">USD</Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>INR</DropdownMenuItem>
                                                <DropdownMenuItem>EUR</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Input id="amount" type="number" placeholder="140.00" />
                                   </div>
                               </div>
                            </div>
                             <Button className="w-full">Send Money</Button>
                        </CardContent>
                    </Card>
                 </div>
              </aside>
          </main>
      </div>
    </div>
  )
}
