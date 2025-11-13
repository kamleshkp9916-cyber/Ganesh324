
"use client";

import React, { useState, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Area,
  Line,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout"
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Sparkles,
  Ticket,
  Truck,
  ArrowLeft,
  Calendar,
  Undo2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ViewType = 'dashboard' | 'total' | 'platform-fees' | 'super-chat' | 'promotions' | 'shipping-fees';

const totalRevenueData = {
  total: 125430.50,
  platformFees: 8520.75,
  superChatCommissions: 1250.00,
  shippingFees: 4500.00,
  promotions: 15000.00,
};

const dailyData = [
  { day: 'Mon', totalRevenue: 12000, refunds: 1200, netRevenue: 10800, sellerShare: 8000, platformEarnings: 2800 },
  { day: 'Tue', totalRevenue: 15000, refunds: 800, netRevenue: 14200, sellerShare: 11000, platformEarnings: 3200 },
  { day: 'Wed', totalRevenue: 18000, refunds: 2000, netRevenue: 16000, sellerShare: 12000, platformEarnings: 4000 },
  { day: 'Thu', totalRevenue: 13000, refunds: 500, netRevenue: 12500, sellerShare: 9500, platformEarnings: 3000 },
  { day: 'Fri', totalRevenue: 22000, refunds: 1500, netRevenue: 20500, sellerShare: 16000, platformEarnings: 4500 },
  { day: 'Sat', totalRevenue: 30000, refunds: 2500, netRevenue: 27500, sellerShare: 21000, platformEarnings: 6500 },
  { day: 'Sun', totalRevenue: 28000, refunds: 1800, netRevenue: 26200, sellerShare: 20000, platformEarnings: 6200 },
];

const weeklyData = [
    { week: 'W1', totalRevenue: 85000, refunds: 7000, netRevenue: 78000, sellerShare: 60000, platformEarnings: 18000 },
    { week: 'W2', totalRevenue: 92000, refunds: 8000, netRevenue: 84000, sellerShare: 65000, platformEarnings: 19000 },
    { week: 'W3', totalRevenue: 78000, refunds: 5000, netRevenue: 73000, sellerShare: 55000, platformEarnings: 18000 },
    { week: 'W4', totalRevenue: 110000, refunds: 10000, netRevenue: 100000, sellerShare: 78000, platformEarnings: 22000 },
];

const monthlyData = [
    { month: 'Jan', totalRevenue: 400000, refunds: 30000, netRevenue: 370000, sellerShare: 280000, platformEarnings: 90000 },
    { month: 'Feb', totalRevenue: 380000, refunds: 25000, netRevenue: 355000, sellerShare: 270000, platformEarnings: 85000 },
    { month: 'Mar', totalRevenue: 520000, refunds: 40000, netRevenue: 480000, sellerShare: 360000, platformEarnings: 120000 },
    { month: 'Apr', totalRevenue: 480000, refunds: 35000, netRevenue: 445000, sellerShare: 330000, platformEarnings: 115000 },
    { month: 'May', totalRevenue: 610000, refunds: 50000, netRevenue: 560000, sellerShare: 420000, platformEarnings: 140000 },
    { month: 'Jun', totalRevenue: 580000, refunds: 45000, netRevenue: 535000, sellerShare: 400000, platformEarnings: 135000 },
];

const recentTransactions = [
    { id: '#ORD-001', type: 'Platform Fee', amount: 150.75, from: 'SellerOrder', date: '2024-07-29' },
    { id: '#SP-005', type: 'Super Chat', amount: 32.00, from: 'Live Stream', date: '2024-07-29' },
    { id: '#SHIP-003', type: 'Shipping Fee', amount: 50.00, from: 'Order', date: '2024-07-28' },
    { id: '#PROMO-002', type: 'Promotion', amount: 1500.00, from: 'Sponsored Product', date: '2024-07-28' },
    { id: '#ORD-002', type: 'Platform Fee', amount: 210.50, from: 'SellerOrder', date: '2024-07-27' },
    { id: '#RFND-001', type: 'Refund', amount: -1200.00, from: 'Order #ORD-001', date: '2024-07-29' },
];

const DetailView = ({ title, description, data, onBack }: { title: string, description: string, data: any[], onBack: () => void }) => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    tx.type === 'Platform Fee' ? 'secondary' :
                                    tx.type === 'Super Chat' ? 'purple' : 
                                    tx.type === 'Refund' ? 'destructive' : 'outline'
                                }>{tx.type}</Badge>
                            </TableCell>
                            <TableCell>{tx.from}</TableCell>
                            <TableCell>{tx.date}</TableCell>
                            <TableCell className="text-right font-medium">₹{tx.amount.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const RevenueChart = ({ data, timeUnit, activeChart }: { data: any[], timeUnit: string, activeChart: string }) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey={timeUnit} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="sellerShare" name="Seller Share" stackId="a" fill="hsl(var(--chart-1))" />
                <Bar dataKey="platformEarnings" name="Platform Earnings" stackId="a" fill="hsl(var(--chart-2))" />
                <Line type="monotone" dataKey="totalRevenue" name="Total Revenue (GMV)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="netRevenue" name="Net Revenue" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
            </ComposedChart>
        </ResponsiveContainer>
    )
}

export default function AdminRevenuePage() {
    const [view, setView] = useState<ViewType>('dashboard');
    const [activeTrend, setActiveTrend] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

    const renderContent = () => {
        switch(view) {
            case 'platform-fees':
                return <DetailView title="Platform Fees" description="Breakdown of all 3% platform fees collected from seller orders." data={recentTransactions.filter(t => t.type === 'Platform Fee')} onBack={() => setView('dashboard')} />;
            case 'super-chat':
                return <DetailView title="Super Chat Commissions" description="Breakdown of all 16% commissions earned from Super Chats in live streams." data={recentTransactions.filter(t => t.type === 'Super Chat')} onBack={() => setView('dashboard')} />;
            case 'promotions':
                 return <DetailView title="Promotions Revenue" description="Details of revenue generated from sponsored products and banners." data={recentTransactions.filter(t => t.type === 'Promotion')} onBack={() => setView('dashboard')} />;
            case 'shipping-fees':
                return <DetailView title="Shipping Fees" description="Breakdown of all shipping fees collected from orders." data={recentTransactions.filter(t => t.type === 'Shipping Fee')} onBack={() => setView('dashboard')} />;
            case 'total':
                 return <DetailView title="Total Revenue" description="A complete breakdown of all revenue streams." data={recentTransactions} onBack={() => setView('dashboard')} />;
            case 'dashboard':
            default:
                const trendData = {
                    daily: { data: dailyData, unit: 'day' },
                    weekly: { data: weeklyData, unit: 'week' },
                    monthly: { data: monthlyData, unit: 'month' },
                };
                
                return (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <button onClick={() => setView('total')} className="w-full text-left">
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{totalRevenueData.total.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                                    </CardContent>
                                </Card>
                            </button>
                            <button onClick={() => setView('platform-fees')} className="w-full text-left">
                                 <Card className="hover:bg-muted/50 transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Platform Fees (3%)</CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{totalRevenueData.platformFees.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">From seller order completions</p>
                                    </CardContent>
                                </Card>
                            </button>
                             <button onClick={() => setView('super-chat')} className="w-full text-left">
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Super Chat (16%)</CardTitle>
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{totalRevenueData.superChatCommissions.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">Commissions from live streams</p>
                                    </CardContent>
                                </Card>
                            </button>
                             <button onClick={() => setView('promotions')} className="w-full text-left">
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Promotions</CardTitle>
                                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{totalRevenueData.promotions.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">From sponsored products &amp; banners</p>
                                    </CardContent>
                                </Card>
                            </button>
                            <button onClick={() => setView('shipping-fees')} className="w-full text-left">
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Shipping Fees</CardTitle>
                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{totalRevenueData.shippingFees.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">Collected from customer orders</p>
                                    </CardContent>
                                </Card>
                            </button>
                        </div>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Revenue Trends</CardTitle>
                                        <CardDescription>
                                            A detailed look at your platform's financial performance.
                                        </CardDescription>
                                    </div>
                                     <Tabs defaultValue="monthly" onValueChange={(value) => setActiveTrend(value as any)} className="w-auto">
                                        <TabsList>
                                            <TabsTrigger value="daily">Daily</TabsTrigger>
                                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <RevenueChart data={trendData[activeTrend].data} timeUnit={trendData[activeTrend].unit} activeChart={'revenue'} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Recent Revenue Transactions</CardTitle>
                                <CardDescription>A log of recent income-generating activities.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Transaction ID</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Source</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentTransactions.map(tx => (
                                            <TableRow key={tx.id}>
                                                <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        tx.type === 'Platform Fee' ? 'secondary' :
                                                        tx.type === 'Super Chat' ? 'purple' : 
                                                        tx.type === 'Refund' ? 'destructive' : 'outline'
                                                    }>{tx.type}</Badge>
                                                </TableCell>
                                                <TableCell>{tx.from}</TableCell>
                                                <TableCell className="text-right font-medium">₹{tx.amount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                );
        }
    }

  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {renderContent()}
      </main>
    </AdminLayout>
  );
}

    

    