
"use client"

import {
  File,
  ListFilter,
  ImageIcon,
  ShieldCheck,
  Menu,
  MoreHorizontal,
  Search,
} from "lucide-react"

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
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthActions } from "@/lib/auth"
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input"

interface Product {
    id: string;
    key?: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: { file?: File; preview: string }[];
    status: "draft" | "active" | "archived";
    seller?: string;
}

const initialProducts: Product[] = [
    {
        id: 'prod_1',
        key: 'prod_1',
        name: "Vintage Camera",
        description: "A classic 35mm film camera from the 70s. Fully functional.",
        price: 12500,
        stock: 15,
        images: [{ preview: "https://placehold.co/80x80.png" }],
        status: "active",
        seller: "FashionFinds"
    },
    {
        id: 'prod_2',
        key: 'prod_2',
        name: "Wireless Headphones",
        description: "Noise-cancelling over-ear headphones with 20-hour battery life.",
        price: 4999,
        stock: 50,
        images: [{ preview: "https://placehold.co/80x80.png" }],
        status: "active",
        seller: "GadgetGuru"
    },
    {
        id: 'prod_3',
        key: 'prod_3',
        name: "Leather Backpack",
        description: "Handmade genuine leather backpack, perfect for daily use.",
        price: 6200,
        stock: 0,
        images: [{ preview: "https://placehold.co/80x80.png" }],
        status: "archived",
        seller: "FashionFinds"
    },
     {
        id: 'prod_4',
        key: 'prod_4',
        name: "Smart Watch",
        description: "Fitness tracker and smartwatch with a vibrant AMOLED display.",
        price: 8750,
        stock: 30,
        images: [],
        status: "draft",
        seller: "GadgetGuru"
    },
];

const ProductTable = ({ products }: { products: Product[] }) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? products.map(product => (
              <TableRow key={product.id}>
                <TableCell className="hidden sm:table-cell">
                  <Link href={`/product/${product.key}`}>
                    {product.images && product.images.length > 0 ? (
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.images[0].preview}
                        width="64"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/product/${product.key}`} className="hover:underline">
                    {product.name}
                  </Link>
                   <p className="text-xs text-muted-foreground font-mono">{product.key}</p>
                </TableCell>
                <TableCell>
                    {product.seller ? (
                         <Link href={`/admin/users?search=${product.seller}`} className="hover:underline text-muted-foreground">
                            {product.seller}
                         </Link>
                    ): (
                        <span className="text-muted-foreground">N/A</span>
                    )}
                </TableCell>
                <TableCell>
                  <Badge variant={'success'}>Active</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  ₹{product.price.toLocaleString()}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.stock}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No active products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{products.length}</strong> of <strong>{products.length}</strong> active products
        </div>
      </CardFooter>
    </Card>
);

export default function AdminProductsPage() {
    const { user, userData, loading } = useAuth();
    const { signOut } = useAuthActions();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const activeProducts = useMemo(() => {
        let products = initialProducts.filter(p => p.status === 'active' && p.stock > 0);
        if (debouncedSearchTerm) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                (p.key && p.key.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
                (p.seller && p.seller.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            );
        }
        return products;
    }, [debouncedSearchTerm]);

    if (loading || userData?.role !== 'admin') {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
    }

    if (!user) {
        router.push('/');
        return null;
    }
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base"><ShieldCheck className="h-6 w-6" /><span className="sr-only">Admin</span></Link>
            <Link href="/admin/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
            <Link href="/admin/orders" className="text-muted-foreground transition-colors hover:text-foreground">Orders</Link>
            <Link href="/admin/users" className="text-muted-foreground transition-colors hover:text-foreground">Users</Link>
            <Link href="/admin/kyc" className="text-muted-foreground transition-colors hover:text-foreground">KYC</Link>
            <Link href="/admin/inquiries" className="text-muted-foreground transition-colors hover:text-foreground">Inquiries</Link>
            <Link href="/admin/messages" className="text-muted-foreground transition-colors hover:text-foreground">Messages</Link>
            <Link href="/admin/products" className="text-foreground transition-colors hover:text-foreground">Products</Link>
            <Link href="/admin/live-control" className="text-muted-foreground transition-colors hover:text-foreground">Live Control</Link>
            <Link href="/admin/settings" className="text-muted-foreground transition-colors hover:text-foreground">Settings</Link>
        </nav>
        <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-6 text-lg font-medium">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>Admin Panel</span></Link>
                    <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                    <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
                    <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                    <Link href="/admin/kyc" className="text-muted-foreground hover:text-foreground">KYC</Link>
                    <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">Inquiries</Link>
                    <Link href="/admin/messages" className="text-muted-foreground hover:text-foreground">Messages</Link>
                    <Link href="/admin/products" className="hover:text-foreground">Products</Link>
                    <Link href="/admin/live-control" className="text-muted-foreground hover:text-foreground">Live Control</Link>
                    <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">Settings</Link>
                </nav>
            </SheetContent>
        </Sheet>
        <div className="ml-auto flex items-center gap-2">
            <form className="ml-auto flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products or sellers..."
                        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </form>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar className="h-9 w-9"><AvatarImage src={user?.photoURL || 'https://placehold.co/40x40.png'} /><AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback></Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Listed Products</CardTitle>
                            <CardDescription>
                                A global view of all active, in-stock products on the platform.
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
                                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem checked>
                                        Available
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>
                                        Out of Stock
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
                </CardHeader>
                <CardContent>
                    <ProductTable products={activeProducts} />
                </CardContent>
            </Card>
        </main>
    </div>
  )
}
