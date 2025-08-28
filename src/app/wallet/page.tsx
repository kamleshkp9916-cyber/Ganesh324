
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CreditCard, Download, Lock, Coins, LayoutGrid, ArrowRightLeft, Send as SendIcon, Settings, HelpCircle, Search, Bell, Plus, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const overviewData = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
  { name: 'Jul', income: 3490, expenses: 4300 },
];

const recentTransactions = [
    { name: 'John Doe', avatar: 'https://placehold.co/40x40.png', type: 'Income', amount: '+ ₹2,500.00', date: '25/07/2024', status: 'Completed' },
    { name: 'Jane Smith', avatar: 'https://placehold.co/40x40.png', type: 'Expense', amount: '- ₹150.00', date: '24/07/2024', status: 'Completed' },
    { name: 'Netflix', avatar: 'https://placehold.co/40x40.png', type: 'Expense', amount: '- ₹649.00', date: '23/07/2024', status: 'Completed' },
    { name: 'Salary', avatar: 'https://placehold.co/40x40.png', type: 'Income', amount: '+ ₹50,000.00', date: '22/07/2024', status: 'Completed' },
    { name: 'Zomato', avatar: 'https://placehold.co/40x40.png', type: 'Expense', amount: '- ₹450.00', date: '22/07/2024', status: 'Pending' },
];

const sendMoneyUsers = [
    { name: 'Alice', avatar: 'https://placehold.co/40x40.png' },
    { name: 'Bob', avatar: 'https://placehold.co/40x40.png' },
    { name: 'Charlie', avatar: 'https://placehold.co/40x40.png' },
    { name: 'David', avatar: 'https://placehold.co/40x40.png' },
];

export default function WalletPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [balance, setBalance] = useState(52450.75);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-background lg:border-r p-4 lg:p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
              <Coins className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">OFSPACE</h1>
          </div>
          <nav className="flex-grow space-y-2">
            <Link href="#" className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary font-semibold">
                <LayoutGrid className="h-5 w-5" />
                Dashboard
            </Link>
            <Link href="#" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-muted">
                <ArrowRightLeft className="h-5 w-5" />
                Transactions
            </Link>
             <Link href="#" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-muted">
                <CreditCard className="h-5 w-5" />
                My Cards
            </Link>
             <Link href="#" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-muted">
                <SendIcon className="h-5 w-5" />
                Send Money
            </Link>
            <Link href="#" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-muted">
                <Settings className="h-5 w-5" />
                Settings
            </Link>
          </nav>
          <Card className="bg-primary/10 border-primary/20 text-center p-4">
              <HelpCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">Need Help?</p>
              <p className="text-xs text-muted-foreground mb-2">Our team is here to assist you.</p>
              <Button size="sm">Get Support</Button>
          </Card>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 grid lg:grid-cols-10 gap-8">
        <div className="lg:col-span-7 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Wallet</h2>
                    <p className="text-muted-foreground">Welcome back, {user.displayName}!</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                        <Input placeholder="Search..." className="pl-10"/>
                    </div>
                     <Button variant="outline" size="icon">
                        <Bell className="h-5 w-5"/>
                     </Button>
                     <Avatar>
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={overviewData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))'
                                }}
                            />
                            <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="expenses" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.map((tx, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={tx.avatar} />
                                                <AvatarFallback>{tx.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{tx.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{tx.type}</TableCell>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell className={tx.type === 'Income' ? 'text-green-500' : 'text-red-500'}>{tx.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant={tx.status === 'Completed' ? 'success' : 'warning'} className="capitalize">{tx.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
        {/* Right Panel */}
        <div className="lg:col-span-3 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Current Balance</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-4xl font-bold mb-4">{'₹' + balance.toLocaleString('en-IN')}</p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="secondary"><SendIcon className="mr-2 h-4 w-4"/> Send</Button>
                        <Button><Download className="mr-2 h-4 w-4"/> Withdraw</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>My Card</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-[1.586] bg-gradient-to-br from-primary to-primary/70 rounded-lg p-4 flex flex-col justify-between text-primary-foreground">
                        <div>
                            <div className="flex justify-between items-center">
                                <span className="font-mono text-sm">OFSPACE</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M15 16.5A4.5 4.5 0 1 1 10.5 12A4.5 4.5 0 0 1 15 16.5m-8.7-6.2a1 1 0 1 1-1-1a1 1 0 0 1 1 1M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8"/></svg>
                            </div>
                        </div>
                        <div>
                            <p className="font-mono tracking-widest text-lg">**** **** **** 1234</p>
                            <div className="flex justify-between text-xs font-mono mt-2">
                                <span>{user.displayName}</span>
                                <span>12/28</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Send Money</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex -space-x-2 overflow-hidden">
                            {sendMoneyUsers.map((u, i) => (
                                <Avatar key={i} className="inline-block h-8 w-8 ring-2 ring-background">
                                    <AvatarImage src={u.avatar} />
                                    <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                         <Button variant="outline" size="icon" className="w-8 h-8 rounded-full">
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </div>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input placeholder="Enter amount" className="pl-6 font-semibold text-lg h-12"/>
                         <Button className="absolute right-2 top-1/2 -translate-y-1/2" size="sm">Send</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
