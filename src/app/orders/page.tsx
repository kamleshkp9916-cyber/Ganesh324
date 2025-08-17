
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, MoreVertical, Package, CheckCircle2, XCircle, Truck } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockOrders = {
  ongoing: [
    { id: 'ORD78901', status: 'In Transit', productName: 'Vintage Leather Jacket', qty: 1, price: '₹7,500', imageUrl: 'https://placehold.co/100x100.png', hint: 'leather jacket fashion' },
    { id: 'ORD78902', status: 'Processing', productName: 'Wireless Earbuds Pro', qty: 1, price: '₹12,000', imageUrl: 'https://placehold.co/100x100.png', hint: 'wireless earbuds case' },
    { id: 'ORD78903', status: 'Shipped', productName: 'Ceramic Dinner Set', qty: 1, price: '₹4,200', imageUrl: 'https://placehold.co/100x100.png', hint: 'ceramic plates stack' },
  ],
  completed: [
    { id: 'ORD65432', status: 'Delivered', productName: 'Smart Home Hub', qty: 1, price: '₹9,800', imageUrl: 'https://placehold.co/100x100.png', hint: 'smart home device' },
    { id: 'ORD65433', status: 'Delivered', productName: 'Professional Camera Drone', qty: 1, price: '₹45,000', imageUrl: 'https://placehold.co/100x100.png', hint: 'camera drone flying' },
  ],
  cancelled: [
    { id: 'ORD10987', status: 'Cancelled', productName: 'Gaming Mouse', qty: 1, price: '₹3,500', imageUrl: 'https://placehold.co/100x100.png', hint: 'rgb gaming mouse' },
  ]
};

const statusConfig = {
    'In Transit': { variant: 'default', className: 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30', icon: <Truck className="h-3 w-3" /> },
    'Processing': { variant: 'default', className: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30', icon: <Package className="h-3 w-3" /> },
    'Shipped': { variant: 'default', className: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30 hover:bg-cyan-500/30', icon: <Package className="h-3 w-3" /> },
    'Delivered': { variant: 'default', className: 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30', icon: <CheckCircle2 className="h-3 w-3" /> },
    'Cancelled': { variant: 'destructive', className: 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30', icon: <XCircle className="h-3 w-3" /> },
};


export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Orders</h1>
        <Button variant="ghost" size="icon">
          <Search className="h-6 w-6" />
        </Button>
      </header>

      <main className="flex-grow p-4">
        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ongoing">
              Ongoing <Badge variant="secondary" className="ml-2">{mockOrders.ongoing.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <Badge variant="secondary" className="ml-2">{mockOrders.completed.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled <Badge variant="secondary" className="ml-2">{mockOrders.cancelled.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ongoing" className="mt-4 space-y-4">
            {mockOrders.ongoing.map((order) => {
              const config = statusConfig[order.status as keyof typeof statusConfig];
              return (
                <Card key={order.id}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Order ID: {order.id}</p>
                        <Badge variant={config.variant} className={cn('gap-1.5', config.className)}>
                            {config.icon}
                            {order.status}
                        </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            <Image src={order.imageUrl} alt={order.productName} width={100} height={100} className="object-cover w-full h-full" data-ai-hint={order.hint} />
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-semibold">{order.productName}</h3>
                            <p className="text-sm text-muted-foreground">Qty: {order.qty}</p>
                            <p className="font-bold mt-2">{order.price}</p>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 self-start">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Contact Seller</DropdownMenuItem>
                                <DropdownMenuItem>Report Issue</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="p-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm">Track Order</Button>
                  </CardFooter>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
             {mockOrders.completed.map((order) => {
              const config = statusConfig[order.status as keyof typeof statusConfig];
              return (
                <Card key={order.id}>
                   <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Order ID: {order.id}</p>
                        <Badge variant={config.variant} className={cn('gap-1.5', config.className)}>
                            {config.icon}
                            {order.status}
                        </Badge>
                    </div>
                  </CardHeader>
                   <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                             <Image src={order.imageUrl} alt={order.productName} width={100} height={100} className="object-cover w-full h-full" data-ai-hint={order.hint} />
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-semibold">{order.productName}</h3>
                            <p className="text-sm text-muted-foreground">Qty: {order.qty}</p>
                            <p className="font-bold mt-2">{order.price}</p>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 self-start">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Buy Again</DropdownMenuItem>
                                <DropdownMenuItem>Leave a Review</DropdownMenuItem>
                                <DropdownMenuItem>Return Item</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardContent>
                   <Separator />
                  <CardFooter className="p-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm">View E-Receipt</Button>
                    <Button size="sm">Buy Again</Button>
                  </CardFooter>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4 space-y-4">
             {mockOrders.cancelled.map((order) => {
              const config = statusConfig[order.status as keyof typeof statusConfig];
              return (
                <Card key={order.id}>
                   <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Order ID: {order.id}</p>
                        <Badge variant={config.variant} className={cn('gap-1.5', config.className)}>
                            {config.icon}
                            {order.status}
                        </Badge>
                    </div>
                  </CardHeader>
                   <CardContent className="p-4">
                    <div className="flex gap-4">
                         <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                             <Image src={order.imageUrl} alt={order.productName} width={100} height={100} className="object-cover w-full h-full" data-ai-hint={order.hint} />
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-semibold">{order.productName}</h3>
                            <p className="text-sm text-muted-foreground">Qty: {order.qty}</p>
                            <p className="font-bold mt-2">{order.price}</p>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 self-start">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Contact Support</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
