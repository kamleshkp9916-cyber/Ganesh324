"use client";

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from '@/components/ui/button';

type ViewType = 'dashboard' | 'total' | 'platform-fees' | 'super-chat' | 'promotions' | 'shipping-fees';

const totalRevenueData = {
  total: 125430.50,
  platformFees: 8520.75,
  superChatCommissions: 1250.00,
  shippingFees: 4500.00,
  promotions: 15000.00,
};

const monthlyData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
];

const recentTransactions = [
    { id: '#ORD-001', type: 'Platform Fee', amount: 150.75, from: 'SellerOrder', date: '2024-07-29' },
    { id: '#SP-005', type: 'Super Chat', amount: 32.00, from: 'Live Stream', date: '2024-07-29' },
    { id: '#SHIP-003', type: 'Shipping Fee', amount: 50.00, from: 'Order', date: '2024-07-28' },
    { id: '#PROMO-002', type: 'Promotion', amount: 1500.00, from: 'Sponsored Product', date: '2024-07-28' },
    { id: '#ORD-002', type: 'Platform Fee', amount: 210.50, from: 'SellerOrder', date: '2024-07-27' },
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
                                    tx.type === 'Super Chat' ? 'purple' : 'outline'
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

export default function AdminRevenuePage() {
    const [view, setView] = useState<ViewType>('dashboard');

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
                return (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                        <p className="text-xs text-muted-foreground">From sponsored products & banners</p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Breakdown</CardTitle>
                                    <CardDescription>Last 6 months</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={monthlyData}>
                                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
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
                                                            tx.type === 'Super Chat' ? 'purple' : 'outline'
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
                        </div>
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
