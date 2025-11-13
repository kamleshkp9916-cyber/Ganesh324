
"use client";

import {
  ArrowLeft,
  Copy,
  CreditCard,
  FileText,
  Home,
  MoreVertical,
  Printer,
  ShieldCheck,
  User,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Circle,
  Hourglass,
  Package,
  PackageCheck,
  PackageOpen,
  Truck,
  XCircle,
  MessageSquare,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useMemo, useRef } from "react"
import Image from "next/image"

import { getOrderById, Order } from "@/lib/order-data"
import { getUserData, UserData } from "@/lib/follow-data"

import { Badge, BadgeProps } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useToast } from "@/hooks/use-toast"


const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes("pending")) return <Hourglass className="h-5 w-5" />;
    if (status.toLowerCase().includes("confirmed")) return <PackageOpen className="h-5 w-5" />;
    if (status.toLowerCase().includes("packed")) return <Package className="h-5 w-5" />;
    if (status.toLowerCase().includes("dispatch")) return <PackageCheck className="h-5 w-5" />;
    if (status.toLowerCase().includes("shipped")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("in transit")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("out for delivery")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("delivered")) return <Home className="h-5 w-5" />;
    if (status.toLowerCase().includes('cancelled') || status.toLowerCase().includes('undelivered') || status.toLowerCase().includes('failed delivery attempt') || status.toLowerCase().includes('return')) return <XCircle className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
};


export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { orderId } = params;
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [buyer, setBuyer] = useState<UserData | null>(null);
  const [seller, setSeller] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof orderId !== 'string') return;
    
    const fetchDetails = async () => {
        setIsLoading(true);
        const fetchedOrder = await getOrderById(orderId);
        setOrder(fetchedOrder);
        
        if (fetchedOrder) {
            const fetchedBuyer = await getUserData(fetchedOrder.userId);
            setBuyer(fetchedBuyer);

            const sellerId = fetchedOrder.products?.[0]?.sellerId;
            if(sellerId) {
                const fetchedSeller = await getUserData(sellerId);
                setSeller(fetchedSeller);
            }
        }
        setIsLoading(false);
    };

    fetchDetails();
  }, [orderId]);

  if (isLoading) {
    return <AdminLayout><div className="flex h-[80vh] items-center justify-center"><LoadingSpinner /></div></AdminLayout>;
  }

  if (!order) {
    return <AdminLayout><div className="flex h-[80vh] items-center justify-center"><p>Order not found.</p></div></AdminLayout>;
  }
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} has been copied.` });
  };
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <AdminLayout>
      <main className="grid flex-1 auto-rows-max gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Order Details
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" /> Print Invoice
            </Button>
            <Button size="sm">Fulfill Order</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        {order.orderId}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(order.orderId, "Order ID")}><Copy className="h-3.5 w-3.5" /></Button>
                    </CardTitle>
                    <CardDescription>
                       Date: {new Date(order.orderDate).toLocaleDateString()}
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/invoices/${order.orderId}`}><FileText className="h-4 w-4 mr-2" />View Invoice</Link>
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.products.map((p, i) => (
                             <TableRow key={i}>
                                <TableCell>
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-sm text-muted-foreground">{p.key}</div>
                                </TableCell>
                                <TableCell>{p.quantity}</TableCell>
                                <TableCell className="text-right">{p.price}</TableCell>
                                <TableCell className="text-right">₹{(parseFloat(p.price.replace(/[^0-9.-]+/g, '')) * p.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Delivery Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {order.timeline.map((item, index) => (
                             <li key={index} className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                                        {getStatusIcon(item.status)}
                                    </div>
                                    {index < order.timeline.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-border" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold">{item.status}</p>
                                    <p className="text-sm text-muted-foreground">{item.date} {item.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No notes from the customer.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Notes & Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <Textarea placeholder="Add a note for internal reference..." />
                  <Button size="sm">Add Note</Button>
                  <Separator />
                  <p className="text-sm text-muted-foreground">No logs for this order yet.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Buyer Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    {buyer ? (
                        <div className="space-y-2">
                             <Link href={`/admin/users/${buyer.uid}`} className="font-medium hover:underline">{buyer.displayName}</Link>
                            <p className="text-muted-foreground">{buyer.email}</p>
                            <p className="text-muted-foreground">{buyer.phone}</p>
                            <address className="not-italic text-muted-foreground">
                                {order.address.village}<br />
                                {order.address.city}, {order.address.state} {order.address.pincode}
                            </address>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Loading buyer...</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                 <CardContent className="text-sm">
                    {seller ? (
                         <div className="space-y-2">
                             <Link href={`/admin/users/${seller.uid}`} className="font-medium hover:underline">{seller.displayName}</Link>
                            <p className="text-muted-foreground">{seller.email}</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Seller not found.</p>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment Status</span>
                    <Badge variant={order.paymentStatus === 'released' ? "success" : order.paymentStatus === 'holding' ? "warning" : "destructive"}>
                        {order.paymentStatus}
                    </Badge>
                  </div>
                   <div className="flex items-center justify-between">
                    <span>Refund Status</span>
                    <Badge variant={order.refundStatus === 'Completed' ? "success" : order.refundStatus === 'Pending' ? "warning" : "outline"}>
                        {order.refundStatus}
                    </Badge>
                  </div>
                  <Separator/>
                   <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
