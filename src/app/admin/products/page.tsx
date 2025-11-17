
"use client"

import {
  File,
  ListFilter,
  ImageIcon,
  ShieldCheck,
  Menu,
  MoreHorizontal,
  Search,
  Users,
  Eye,
  DollarSign,
  ArrowLeft,
  Package,
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
import { AdminLayout } from "@/components/admin/admin-layout"


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
    views?: number;
    sold?: number;
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
        seller: "FashionFinds",
        views: 12456,
        sold: 125,
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
        seller: "GadgetGuru",
        views: 25890,
        sold: 830,
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
        seller: "FashionFinds",
        views: 5600,
        sold: 98,
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
        seller: "GadgetGuru",
        views: 18340,
        sold: 450,
    },
];

const ProductTable = ({ products, onViewDetails }: { products: Product[], onViewDetails: (product: Product) => void }) => (
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
              <TableHead className="hidden lg:table-cell text-right">Analytics</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? products.map(product => (
              <TableRow key={product.id} onClick={() => onViewDetails(product)} className="cursor-pointer">
                <TableCell className="hidden sm:table-cell">
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
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
                   <p className="text-xs text-muted-foreground font-mono">{product.key}</p>
                </TableCell>
                <TableCell>
                    {product.seller ? (
                         <span className="text-muted-foreground">
                            {product.seller}
                         </span>
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
                <TableCell className="hidden lg:table-cell text-right">
                    <div className="flex flex-col items-end text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Eye className="h-3 w-3" /> {product.views?.toLocaleString() || 0} views</div>
                        <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {product.sold?.toLocaleString() || 0} sales</div>
                        <div className="flex items-center gap-1.5"><DollarSign className="h-3 w-3" /> ₹{((product.sold || 0) * product.price).toLocaleString()} revenue</div>
                    </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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

const ProductDetailView = ({ product, onBack }: { product: Product, onBack: () => void }) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Products</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        {product.images && product.images.length > 0 ? (
                             <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative">
                                <Image
                                    alt={product.name}
                                    className="object-cover"
                                    layout="fill"
                                    src={product.images[0].preview}
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Badge variant="secondary">{product.key}</Badge>
                            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
                            <p className="text-muted-foreground">{product.description}</p>
                        </div>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-semibold">Price:</span> ₹{product.price.toLocaleString()}</div>
                            <div><span className="font-semibold">Stock:</span> {product.stock}</div>
                            <div><span className="font-semibold">Seller:</span> {product.seller || 'N/A'}</div>
                            <div><span className="font-semibold">Status:</span> <Badge variant={product.status === 'active' ? 'success' : 'outline'}>{product.status}</Badge></div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function AdminProductsPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const activeProducts = useMemo(() => {
        let products = initialProducts.filter(p => p.status === 'active');
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
    
    if(selectedProduct) {
        return (
            <AdminLayout>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <ProductDetailView product={selectedProduct} onBack={() => setSelectedProduct(null)} />
                </main>
            </AdminLayout>
        );
    }
  
  return (
    <AdminLayout>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>
                                A global view of all active products on the platform. Click a row to see details.
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
                    <ProductTable products={activeProducts} onViewDetails={setSelectedProduct} />
                </CardContent>
            </Card>
        </main>
    </AdminLayout>
  )
}
