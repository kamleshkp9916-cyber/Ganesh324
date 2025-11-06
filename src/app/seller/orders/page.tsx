
"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  ListFilter,
  MoreVertical,
  Printer,
  Truck,
  MessageSquare,
  Menu,
  Package2,
  Video,
  XCircle,
  Check,
  CircleUser,
  ShieldCheck,
  RadioTower,
  Search,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { productDetails } from "@/lib/product-data";
import { updateOrderStatus, getOrderStatus } from "@/ai/flows/chat-flow";
import { getStatusFromTimeline, Order, saveAllOrders } from "@/lib/order-data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { format } from "date-fns";
import { addTransaction } from "@/lib/transaction-history";
import { SellerHeader } from "@/components/seller/seller-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"

const mockSellerOrdersData = [
    {
        orderId: "#ORD5896",
        productId: "prod_1",
        customer: { name: "Ganesh Prajapati", email: "ganesh@example.com", phone: "+91 98765 43210", address: "123 Sunshine Apartments, Koregaon Park, Pune, Maharashtra - 411001" },
        product: { name: "Vintage Camera", imageUrl: "https://placehold.co/80x80.png", hint: "vintage camera" },
        date: "July 27, 2024",
        time: "10:31 PM",
        status: "Fulfilled",
        price: 12500.00,
        type: "Listed Product"
    },
    {
        orderId: "#ORD5897",
        productId: "prod_2",
        customer: { name: "Jane Doe", email: "jane.d@example.com", phone: "+91 98765 43211", address: "456 Moonbeam Towers, Bandra West, Mumbai, Maharashtra - 400050" },
        product: { name: "Wireless Headphones", imageUrl: "https://placehold.co/80x80.png", hint: "headphones" },
        date: "July 26, 2024",
        time: "08:16 AM",
        status: "Fulfilled",
        price: 4999.00,
        type: "Live Stream"
    },
    {
        orderId: "#ORD5902",
        productId: "prod_3",
        customer: { name: "David Garcia", email: "david.g@example.com", phone: "+91 98765 43212", address: "789 Starlight Plaza, Indiranagar, Bengaluru, Karnataka - 560038" },
        product: { name: "Bluetooth Speaker", imageUrl: "https://placehold.co/80x80.png", hint: "bluetooth speaker" },
        date: "July 22, 2024",
        time: "07:00 PM",
        status: "Processing",
        price: 3200.00,
        type: "Live Stream"
    },
     {
        orderId: "#ORD5905",
        productId: "prod_4",
        customer: { name: "Peter Jones", email: "peter.j@example.com", phone: "+91 98765 43213", address: "101 Galaxy Heights, Malviya Nagar, Jaipur, Rajasthan - 302017" },
        product: { name: "Designer Sunglasses", imageUrl: "https://placehold.co/80x80.png", hint: "sunglasses" },
        date: "July 28, 2024",
        time: "02:30 PM",
        status: "Pending",
        price: 7800.00,
        type: "Listed Product"
    },
    {
        orderId: "#ORD5903",
        productId: "prod_5",
        customer: { name: "Jessica Rodriguez", email: "jessica.r@example.com", phone: "+91 98765 43214", address: "222 Ocean View, Besant Nagar, Chennai, Tamil Nadu - 600090" },
        product: { name: "Coffee Maker", imageUrl: "https://placehold.co/80x80.png", hint: "coffee maker" },
        date: "July 21, 2024",
        time: "11:00 AM",
        status: "Cancelled",
        price: 4500.00,
        type: "Listed Product"
    }
].map(order => {
    const details = productDetails[order.productId as keyof typeof productDetails];
    if (details) {
        return {
            ...order,
            product: {
                name: details.name,
                imageUrl: details.images[0],
                hint: details.hint
            },
            price: parseFloat(details.price.replace('₹', '').replace(',', ''))
        }
    }
    return order;
});

type SellerOrder = (typeof mockSellerOrdersData)[0];

function OrderDetailCard({ order }: { order: SellerOrder }) {
    const { toast } = useToast();
    const deliveryCharge = 50.00;
    const taxRate = 0.05; // 5%
    const taxes = order.price * taxRate;
    const totalAmount = order.price + deliveryCharge + taxes;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to Clipboard",
            description: `${label} has been copied.`
        });
    };
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <DialogContent className="max-w-3xl p-0" id="printable-order">
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-order, #printable-order * {
                        visibility: visible;
                    }
                    #printable-order {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                `}
            </style>
            <DialogHeader className="p-6 pb-0">
                <div className="flex justify-between items-start">
                    <div>
                        <DialogTitle className="text-2xl">Order Details</DialogTitle>
                        <p className="text-muted-foreground">Order ID: {order.orderId}</p>
                    </div>
                    <Button onClick={handlePrint} variant="outline" size="sm" className="no-print">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
            </DialogHeader>
            <div className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">Customer Details</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Name:</strong> {order.customer.name}</p>
                            <p><strong>Email:</strong> {order.customer.email}</p>
                            <p><strong>Phone:</strong> {order.customer.phone}</p>
                            <p><strong>Address:</strong> {order.customer.address}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Order Information</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <div><strong>Date:</strong> {order.date} at {order.time}</div>
                            <div className="flex items-center gap-2"><strong>Status:</strong> <Badge variant={order.status === 'Fulfilled' ? "success" : order.status === 'Cancelled' ? 'destructive' : "outline"}>{order.status}</Badge></div>
                            <div className="flex items-center gap-2"><strong>Type:</strong> <Badge variant={order.type === 'Live Stream' ? "destructive" : "secondary"}>{order.type}</Badge></div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="font-semibold mb-2">Product Details</h3>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <Image src={order.product.imageUrl} alt={order.product.name} width={64} height={64} className="rounded-md" data-ai-hint={order.product.hint} />
                        <div className="flex-grow">
                            <p className="font-medium">{order.product.name}</p>
                            <p className="text-sm text-muted-foreground">Product ID: {order.productId}</p>
                        </div>
                        <p className="font-semibold">₹{order.price.toFixed(2)}</p>
                    </div>
                </div>
                
                <Separator />
                
                <div>
                     <h3 className="font-semibold mb-2">Payment Summary</h3>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Product Price:</span>
                            <span>₹{order.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery Charges:</span>
                            <span>₹{deliveryCharge.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">GST (5%):</span>
                            <span>₹{taxes.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-base">
                            <span>Total Amount:</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                     </div>
                </div>

            </div>
        </DialogContent>
    );
}

export default function SellerOrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [orders, setOrders] = useState<SellerOrder[]>(mockSellerOrdersData);
    const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const filteredOrders = useMemo(() => {
        let tempOrders = orders;

        if (statusFilter !== "All") {
            tempOrders = tempOrders.filter(order => order.status === statusFilter);
        }

        if (debouncedSearchTerm) {
            const lowercasedQuery = debouncedSearchTerm.toLowerCase();
            tempOrders = tempOrders.filter(order =>
                order.orderId.toLowerCase().includes(lowercasedQuery) ||
                order.customer.name.toLowerCase().includes(lowercasedQuery) ||
                order.product.name.toLowerCase().includes(lowercasedQuery)
            );
        }

        return tempOrders;
    }, [orders, statusFilter, debouncedSearchTerm]);

    const handleUpdateStatus = (orderId: string, newStatus: 'Order Confirmed' | 'Cancelled by seller') => {
        const orderToUpdate = orders.find(o => o.orderId === orderId);
        if (!orderToUpdate) return;
    
        const allOrdersJSON = localStorage.getItem('streamcart_orders');
        let allOrders: Order[] = allOrdersJSON ? JSON.parse(allOrdersJSON) : [];
        const orderIndex = allOrders.findIndex(o => o.orderId === orderId);
    
        if (orderIndex !== -1) {
            const updatedOrder = { ...allOrders[orderIndex] };
    
            if (newStatus === 'Order Confirmed') {
                const pendingIndex = updatedOrder.timeline.findIndex(item => item.status === 'Pending');
                if (pendingIndex !== -1) {
                    updatedOrder.timeline[pendingIndex].completed = true;
                    updatedOrder.timeline[pendingIndex].date = format(new Date(), 'MMM dd, yyyy');
                    updatedOrder.timeline[pendingIndex].time = format(new Date(), 'p');
                }
                 const confirmedIndex = updatedOrder.timeline.findIndex(item => item.status === 'Order Confirmed');
                 if (confirmedIndex !== -1) {
                    updatedOrder.timeline[confirmedIndex].completed = true;
                    updatedOrder.timeline[confirmedIndex].date = format(new Date(), 'MMM dd, yyyy');
                    updatedOrder.timeline[confirmedIndex].time = format(new Date(), 'p');
                 }

            } else if (newStatus === 'Cancelled by seller') {
                updatedOrder.timeline.push({
                    status: newStatus,
                    date: format(new Date(), 'MMM dd, yyyy'),
                    time: format(new Date(), 'p'),
                    completed: true
                });
                addTransaction({
                    id: Date.now(),
                    transactionId: `REF-${orderId.replace('#', '')}`,
                    type: 'Refund',
                    description: `For cancelled order ${orderId}`,
                    date: format(new Date(), 'MMM dd, yyyy'),
                    time: format(new Date(), 'p'),
                    amount: orderToUpdate.price,
                    status: 'Processing',
                });
            }
    
            allOrders[orderIndex] = updatedOrder;
            saveAllOrders(allOrders);

             setOrders(prevOrders => prevOrders.map(o => o.orderId === orderId ? { ...o, status: newStatus === 'Order Confirmed' ? 'Processing' : 'Cancelled' } : o));
            
             toast({
                title: `Order ${newStatus === 'Order Confirmed' ? 'Accepted' : 'Declined'}`,
                description: `Order ${orderId} has been updated.`,
            });
        }
    };
    
    const handleExport = () => {
        if (filteredOrders.length === 0) {
            toast({ title: "No data to export", variant: "destructive" });
            return;
        }

        const headers = ["Order ID", "Customer", "Product", "Type", "Status", "Amount", "Date"];
        const rows = filteredOrders.map(order => [
            order.orderId,
            order.customer.name,
            order.product.name,
            order.type,
            order.status,
            order.price.toFixed(2),
            order.date
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `seller_orders_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isMounted || loading) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
    }

    if (!user) {
        router.push('/');
        return null;
    }

  return (
    <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
           <SellerHeader />
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                 <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>
                            A list of all orders from your live streams and product listings.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-1">
                                        <ListFilter className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Filter
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                        <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Pending">Pending</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Processing">Processing</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Fulfilled">Fulfilled</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Cancelled">Cancelled</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                                <File className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Export
                                </span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden md:table-cell">Product</TableHead>
                                <TableHead className="hidden md:table-cell">Type</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right w-[160px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.orderId}>
                                    <TableCell>
                                        <div className="font-medium cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>{order.orderId}</div>
                                        <div className="text-xs text-muted-foreground">{order.date}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.customer.name}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="font-medium cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>{order.product.name}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant={order.type === 'Live Stream' ? "destructive" : "secondary"}>{order.type}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant={order.status === 'Fulfilled' ? "success" : order.status === 'Cancelled' ? 'destructive' : "outline"} className="capitalize">{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">₹{order.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        {order.status === 'Pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" onClick={() => handleUpdateStatus(order.orderId, 'Order Confirmed')} className="h-8">
                                                    <Check className="mr-2 h-4 w-4" /> Accept
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive" className="h-8">
                                                            <XCircle className="mr-2 h-4 w-4" /> Decline
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will cancel the order for the customer and cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleUpdateStatus(order.orderId, 'Cancelled by seller')}>Confirm</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>View Details</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                    Showing <strong>1-{filteredOrders.length > 5 ? 5 : filteredOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders
                    </div>
                    <Pagination className="ml-auto mr-0 w-auto">
                        <PaginationContent>
                        <PaginationItem>
                            <Button size="icon" variant="outline" className="h-6 w-6">
                            <ChevronLeft className="h-3.5 w-3.5" />
                            <span className="sr-only">Previous Order</span>
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button size="icon" variant="outline" className="h-6 w-6">
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="sr-only">Next Order</span>
                            </Button>
                        </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
                </Card>
            </main>
            {selectedOrder && <OrderDetailCard order={selectedOrder} />}
        </div>
    </Dialog>
  )
}

    