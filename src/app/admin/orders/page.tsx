
"use client"

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  File,
  ListFilter,
  MoreVertical,
  Search,
  ShieldCheck,
  Menu,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"

import { Badge, BadgeProps } from "@/components/ui/badge"
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { allOrderData, OrderId } from "@/lib/order-data"
import { useAuthActions } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"

const ADMIN_EMAIL = "samael.prajapati@example.com";

const mockUsers = {
    "USER8432": { name: "Ganesh Prajapati", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8443": { name: "Olivia Martinez", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8438": { name: "Peter Jones", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8442": { name: "Michael Chen", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8437": { name: "Laura Williams", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8433": { name: "Jane Doe", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8434": { name: "Alex Smith", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8435": { name: "Emily Brown", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8436": { name: "Chris Wilson", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8439": { name: "Sarah Miller", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8440": { name: "David Garcia", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8441": { name: "Jessica Rodriguez", avatarUrl: "https://placehold.co/40x40.png" },
    "USER8450": { name: "Kevin Scott", avatarUrl: "https://placehold.co/40x40.png" },
};

const getFullMockOrders = () => Object.entries(allOrderData).map(([orderId, orderDetails]) => {
    // @ts-ignore
    const userId = orderDetails.customerId;
    const user = mockUsers[userId as keyof typeof mockUsers] || { name: 'Unknown User', avatarUrl: '' };
    const status = orderDetails.timeline[orderDetails.timeline.length - 1].status.split(':')[0].trim();
    
    return {
        orderId: orderId,
        user: user,
        product: { name: orderDetails.product.name },
        date: orderDetails.orderDate,
        status: status,
        total: parseFloat(orderDetails.product.price.replace('₹', '').replace(/,/g, '')),
    };
});

type Order = ReturnType<typeof getFullMockOrders>[0];

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (!loading && user?.email === ADMIN_EMAIL) {
        setOrders(getFullMockOrders());
    }
  }, [loading, user]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  if (!isMounted || loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
            <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }
  
  const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
        case 'Delivered': return 'success';
        case 'Shipped': case 'In Transit': case 'Out for Delivery': return 'warning';
        case 'Cancelled by user': case 'Returned': return 'destructive';
        case 'Pending': return 'info';
        default: return 'outline';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied!",
        description: `${text} has been copied to your clipboard.`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base"><ShieldCheck className="h-6 w-6" /><span className="sr-only">Admin</span></Link>
                <Link href="/admin/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                <Link href="/admin/orders" className="text-foreground transition-colors hover:text-foreground">Orders</Link>
                <Link href="/admin/users" className="text-muted-foreground transition-colors hover:text-foreground">Users</Link>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Sellers</Link>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Products</Link>
            </nav>
            <Sheet>
                <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>Admin Panel</span></Link>
                        <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                        <Link href="/admin/orders" className="hover:text-foreground">Orders</Link>
                        <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search orders..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </form>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <Avatar className="h-9 w-9"><AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} /><AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback></Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Admin Account</DropdownMenuLabel><DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem><DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>Manage and view all customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map(order => (
                                <TableRow key={order.orderId}>
                                    <TableCell className="font-medium">{order.orderId}</TableCell>
                                    <TableCell>{order.user.name}</TableCell>
                                    <TableCell>{order.product.name}</TableCell>
                                    <TableCell><Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge></TableCell>
                                    <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => router.push(`/admin/orders/${order.orderId}`)}>View Details</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => copyToClipboard(order.orderId)}>Copy Order ID</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>1-{filteredOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders
                    </div>
                </CardFooter>
            </Card>
        </main>
    </div>
  )
}
