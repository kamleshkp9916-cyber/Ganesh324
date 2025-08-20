
"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  ListFilter,
  MoreVertical,
  Truck,
} from "lucide-react"
import { useRouter } from "next/navigation"

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
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"


const mockSellerOrders = [
    {
        orderId: "#ORD5896",
        customer: { name: "Ganesh Prajapati", email: "ganesh@example.com" },
        product: { name: "Vintage Camera" },
        date: "July 27, 2024",
        status: "Fulfilled",
        total: "₹12,500.00",
        type: "Listed Product"
    },
    {
        orderId: "#ORD5897",
        customer: { name: "Jane Doe", email: "jane.d@example.com" },
        product: { name: "Wireless Headphones" },
        date: "July 26, 2024",
        status: "Fulfilled",
        total: "₹4,999.00",
        type: "Live Stream"
    },
    {
        orderId: "#ORD5902",
        customer: { name: "David Garcia", email: "david.g@example.com" },
        product: { name: "Bluetooth Speaker" },
        date: "July 22, 2024",
        status: "Processing",
        total: "₹3,200.00",
        type: "Live Stream"
    },
     {
        orderId: "#ORD5905",
        customer: { name: "Peter Jones", email: "peter.j@example.com" },
        product: { name: "Designer Sunglasses" },
        date: "July 28, 2024",
        status: "Pending",
        total: "₹7,800.00",
        type: "Listed Product"
    },
    {
        orderId: "#ORD5903",
        customer: { name: "Jessica Rodriguez", email: "jessica.r@example.com" },
        product: { name: "Coffee Maker" },
        date: "July 21, 2024",
        status: "Cancelled",
        total: "₹4,500.00",
        type: "Listed Product"
    }
];


export default function SellerOrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || loading) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
    }

    if (!user) {
        router.push('/');
        return null;
    }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="flex items-center gap-4 pt-4">
                 <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                   All Orders
                </h1>
                <div className="ml-auto flex items-center gap-2">
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
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                        Fulfilled
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Processing</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                        Cancelled
                    </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                    </span>
                </Button>
                </div>
            </div>
            <Card>
            <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                A list of all orders from your live streams and product listings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-border">
                {mockSellerOrders.map((order) => (
                    <div key={order.orderId} className="grid grid-cols-2 md:grid-cols-5 items-start gap-4 py-4">
                        <div className="font-medium col-span-2 md:col-span-1">
                            <p>{order.orderId}</p>
                            <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                             <p className="font-medium">{order.customer.name}</p>
                             <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                        </div>
                        <div className="text-left md:text-center">
                            <Badge variant={order.type === 'Live Stream' ? "destructive" : "secondary"}>
                                {order.type}
                            </Badge>
                        </div>
                         <div className="text-left md:text-center">
                            <Badge variant={order.status === 'Fulfilled' ? "success" : order.status === 'Cancelled' ? 'destructive' : "outline"} className="capitalize">
                                {order.status}
                            </Badge>
                        </div>
                        <div className="font-medium text-right">{order.total}</div>
                    </div>
                ))}
                </div>
            </CardContent>
            <CardFooter>
                <div className="text-xs text-muted-foreground">
                Showing <strong>1-5</strong> of <strong>{mockSellerOrders.length}</strong> orders
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
    </div>
  )
}

    