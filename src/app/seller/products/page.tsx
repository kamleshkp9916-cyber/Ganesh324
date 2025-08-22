
"use client"

import {
  File,
  PlusCircle,
  MoreHorizontal,
  ListFilter,
  Image as ImageIcon,
  ArrowLeft
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ProductForm, Product } from "@/components/seller/product-form"
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import Link from "next/link"

const initialProducts: Product[] = [
    {
        id: 'prod_1',
        name: "Vintage Camera",
        description: "A classic 35mm film camera from the 70s. Fully functional.",
        price: 12500,
        stock: 15,
        image: { preview: "https://placehold.co/80x80.png" },
        status: "active"
    },
    {
        id: 'prod_2',
        name: "Wireless Headphones",
        description: "Noise-cancelling over-ear headphones with 20-hour battery life.",
        price: 4999,
        stock: 50,
        image: { preview: "https://placehold.co/80x80.png" },
        status: "active"
    },
    {
        id: 'prod_3',
        name: "Leather Backpack",
        description: "Handmade genuine leather backpack, perfect for daily use.",
        price: 6200,
        stock: 0,
        image: { preview: "https://placehold.co/80x80.png" },
        status: "archived"
    },
     {
        id: 'prod_4',
        name: "Smart Watch",
        description: "Fitness tracker and smartwatch with a vibrant AMOLED display.",
        price: 8750,
        stock: 30,
        image: { preview: "https://placehold.co/80x80.png" },
        status: "draft"
    },
];

export default function SellerProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const { user, loading } = useAuth();
    const router = useRouter();


    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const storedProducts = localStorage.getItem('sellerProducts');
            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            } else {
                setProducts(initialProducts);
                localStorage.setItem('sellerProducts', JSON.stringify(initialProducts));
            }
        }
    }, []);
    
    useEffect(() => {
        if (isMounted) {
             localStorage.setItem('sellerProducts', JSON.stringify(products));
        }
    }, [products, isMounted]);

    if (!isMounted || loading) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
    }

    if (!user) {
        router.push('/');
        return null;
    }

    const handleSaveProduct = (product: Product) => {
        if (editingProduct) {
            setProducts(products.map(p => p.id === product.id ? product : p));
        } else {
            setProducts([...products, { ...product, id: `prod_${Date.now()}` }]);
        }
        setIsFormOpen(false);
        setEditingProduct(undefined);
    };
    
    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDeleteProduct = (productId: string) => {
        setProducts(products.filter(p => p.id !== productId));
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setEditingProduct(undefined);
        }
        setIsFormOpen(open);
    }
  
  return (
    <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs defaultValue="all">
            <div className="flex items-center gap-4">
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                    Archived
                </TabsTrigger>
                </TabsList>
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
                <DialogTrigger asChild>
                    <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Product
                        </span>
                    </Button>
                </DialogTrigger>
                </div>
            </div>
            <TabsContent value="all">
                <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>
                    Manage your products and view their sales performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                            Price
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                            Stock
                        </TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(product => (
                        <TableRow key={product.id}>
                            <TableCell className="hidden sm:table-cell">
                             <Link href={`/product/${product.id}`}>
                                {product.image?.preview ? (
                                    <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={product.image.preview}
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
                                <Link href={`/product/${product.id}`} className="hover:underline">
                                    {product.name}
                                </Link>
                            </TableCell>
                            <TableCell>
                            <Badge variant={product.status === 'active' ? 'outline' : 'secondary'}>{product.status}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                            ₹{product.price.toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                            {product.stock}
                            </TableCell>
                            <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleEditProduct(product)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDeleteProduct(product.id as string)}>Delete</DropdownMenuItem>
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
                    Showing <strong>1-{products.length > 10 ? 10 : products.length}</strong> of <strong>{products.length}</strong>{" "}
                    products
                    </div>
                </CardFooter>
                </Card>
            </TabsContent>
            </Tabs>
        </main>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                    {editingProduct ? "Update the details of your product." : "Fill in the details to add a new product to your store."}
                </DialogDescription>
            </DialogHeader>
            <ProductForm onSave={handleSaveProduct} productToEdit={editingProduct} />
        </DialogContent>
      </div>
    </Dialog>
  )
}
