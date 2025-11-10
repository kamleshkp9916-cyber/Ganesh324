
"use client";

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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

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
    { id: '#ORD-001', type: 'Platform Fee', amount: 150.75, from: 'SellerOrder' },
    { id: '#SP-005', type: 'Super Chat', amount: 32.00, from: 'Live Stream' },
    { id: '#SHIP-003', type: 'Shipping Fee', amount: 50.00, from: 'Order' },
    { id: '#PROMO-002', type: 'Promotion', amount: 1500.00, from: 'Sponsored Product' },
    { id: '#ORD-002', type: 'Platform Fee', amount: 210.50, from: 'SellerOrder' },
];

export default function AdminRevenuePage() {
  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/revenue/total">
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
            </Link>
            <Link href="/admin/revenue/platform-fees">
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
            </Link>
             <Link href="/admin/revenue/super-chat">
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
            </Link>
             <Link href="/admin/revenue/promotions">
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
            </Link>
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
      </main>
    </AdminLayout>
  );
}
