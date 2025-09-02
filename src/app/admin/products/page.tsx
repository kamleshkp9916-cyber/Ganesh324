
"use client"

import {
  File,
  PlusCircle,
  MoreHorizontal,
  ListFilter,
  ImageIcon,
  ArrowLeft,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  Menu
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
import { useState, useEffect, useMemo } from "react"
import { ProductForm, Product } from "@/components/seller/product-form"
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthActions } from "@/lib/auth"

const initialProducts: Product[] = [
    {
        id: 'prod_1',
        name: "Vintage Camera",
        description: "A classic 35mm film camera from the 70s. Fully functional.",
        price: 12500,
        stock: 15,
        images: [{ file: undefined, preview: "https://placehold.co/80x80.png" }],
        status: "active"
    },
    {
        id: 'prod_2',
        name: "Wireless Headphones",
        description: "Noise-cancelling over-ear headphones with 20-hour battery life.",
        price: 4999,
        stock: 50,
        images: [{ file: undefined, preview: "https://placehold.co/80x80.png" }],
        status: "active"
    },
    {
        id: 'prod_3',
        name: "Leather Backpack",
        description: "Handmade genuine leather backpack, perfect for daily use.",
        price: 6200,
        stock: 0,
        images: [{ file: undefined, preview: "https://placehold.co/80x80.png" }],
        status: "archived"
    },
     {
        id: 'prod_4',
        name: "Smart Watch",
        description: "Fitness tracker and smartwatch with a vibrant AMOLED display.",
        price: 8750,
        stock: 30,
        images: [],
        status: "draft"
    },
];

const mockQandA = [
    { id: 1, question: "Does this camera come with a roll of film?", questioner: "Alice", answer: "Yes, it comes with one 24-exposure roll of color film to get you started!", answerer: "GadgetGuru" },
    { id: 2, question: "Is the battery for the light meter included?", questioner: "Bob", answer: "It is! We include a fresh battery so you can start shooting right away.", answerer: "GadgetGuru" },
    { id: 3, question: "What is the warranty on this?", questioner: "Charlie", answer: "We offer a 6-month warranty on all our refurbished vintage cameras.", answerer: "GadgetGuru" },
    { id: 4, question: "Can you ship this to the UK?", questioner: "Diana", answer: null, answerer: null },
    { id: 5, question: "Is the camera strap original?", questioner: "Eve", answer: "This one comes with a new, high-quality leather strap, not the original.", answerer: "GadgetGuru" },
];

const ManageQnaDialog = ({ product }: { product: Product }) => {
    const [qna, setQna] = useState(mockQandA);
    const { toast } = useToast();

    const handleAnswerSubmit = (questionId: number, answer: string) => {
        setQna(qna.map(item => item.id === questionId ? { ...item, answer } : item));
        toast({ title: "Answer Submitted!", description: "Your answer has been posted." });
    };

    return (
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Manage Q&A for {product.name}</DialogTitle>
                <DialogDescription>View and answer questions from customers.</DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-6">
                    <div className="space-y-6">
                        {qna.map(item => (
                            <div key={item.id} className="text-sm">
                                <div className="flex items-center gap-2 font-semibold">
                                    <HelpCircle className="w-4 h-4 text-primary" />
                                    <p>{item.question}</p>
                                </div>
                                <div className="pl-6 mt-2">
                                    {item.answer ? (
                                        <p className="text-muted-foreground bg-muted/50 p-2 rounded-md"><strong>Your Answer:</strong> {item.answer}</p>
                                    ) : (
                                        <form className="flex items-start gap-2" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            const answer = formData.get('answer') as string;
                                            handleAnswerSubmit(item.id, answer);
                                            (e.target as HTMLFormElement).reset();
                                        }}>
                                            <Textarea name="answer" placeholder="Type your answer..." className="flex-grow" rows={2} />
                                            <Button type="submit" size="sm">Answer</Button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ))}
                         {qna.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No questions for this product yet.</p>
                         )}
                    </div>
                </ScrollArea>
            </div>
        </DialogContent>
    );
};


const ProductTable = ({ products, onEdit, onDelete, onManageQna }: { products: Product[], onEdit: (product: Product) => void, onDelete: (productId: string) => void, onManageQna: (product: Product) => void }) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Stock</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? products.map(product => (
              <TableRow key={product.id} className={cn(product.stock === 0 && 'bg-destructive/10')}>
                <TableCell className="hidden sm:table-cell">
                  <Link href={`/product/${product.id}`}>
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
                  <Link href={`/product/${product.id}`} className="hover:underline">
                    {product.name}
                  </Link>
                  {product.stock === 0 && <span className="text-xs text-destructive ml-2">(Sold Out)</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === 'active' ? 'outline' : 'secondary'}>{product.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  ₹{product.price.toLocaleString()}
                </TableCell>
                <TableCell className={cn("hidden md:table-cell", product.stock === 0 && "text-destructive font-bold")}>
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
                      <DropdownMenuItem onSelect={() => onEdit(product)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onManageQna(product)}>Manage Q&A</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(product.id as string)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No products found in this category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{products.length > 10 ? 10 : products.length}</strong> of <strong>{products.length}</strong> products
        </div>
      </CardFooter>
    </Card>
);

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isQnaOpen, setIsQnaOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const { user, userData, loading } = useAuth();
    const { signOut } = useAuthActions();
    const router = useRouter();
    const { toast } = useToast();

    // In an admin view, we'd fetch all products. For this demo, we'll use a single combined list.
    const getAllProductsKey = () => 'allSellerProducts';

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined' && user && userData?.role === 'admin') {
            const productsKey = getAllProductsKey();
            const storedProducts = localStorage.getItem(productsKey);
            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            } else {
                setProducts(initialProducts);
                localStorage.setItem(productsKey, JSON.stringify(initialProducts));
            }
        }
    }, [user, userData]);
    
    useEffect(() => {
        if (isMounted && user && userData?.role === 'admin') {
             const productsKey = getAllProductsKey();
             localStorage.setItem(productsKey, JSON.stringify(products));
        }
    }, [products, isMounted, user, userData]);

    const activeProducts = useMemo(() => products.filter(p => p.status === 'active'), [products]);
    const draftProducts = useMemo(() => products.filter(p => p.status === 'draft'), [products]);
    const archivedProducts = useMemo(() => products.filter(p => p.status === 'archived'), [products]);

    if (!isMounted || loading || userData?.role !== 'admin') {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
    }

    if (!user) {
        router.push('/');
        return null;
    }

    const handleSaveProduct = (product: Product) => {
        let wasInStock = true;
        if (editingProduct) {
            const originalProduct = products.find(p => p.id === product.id);
            if (originalProduct) {
                wasInStock = originalProduct.stock > 0;
            }
            setProducts(products.map(p => p.id === product.id ? product : p));
        } else {
            setProducts(prev => [...prev, { ...product, id: `prod_${Date.now()}` }]);
        }

        if (product.stock === 0 && wasInStock) {
            toast({
                variant: "destructive",
                title: "Product Sold Out!",
                description: `${product.name} is now out of stock.`,
            });
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

    const handleManageQna = (product: Product) => {
        setSelectedProduct(product);
        setIsQnaOpen(true);
    };
  
  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
           <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base"><ShieldCheck className="h-6 w-6" /><span className="sr-only">Admin</span></Link>
                    <Link href="/admin/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                    <Link href="/admin/orders" className="text-muted-foreground transition-colors hover:text-foreground">Orders</Link>
                    <Link href="/admin/users" className="text-muted-foreground transition-colors hover:text-foreground">Users</Link>
                    <Link href="/admin/inquiries" className="text-muted-foreground transition-colors hover:text-foreground">Inquiries</Link>
                    <Link href="/admin/messages" className="text-muted-foreground transition-colors hover:text-foreground">Messages</Link>
                    <Link href="/admin/products" className="text-foreground transition-colors hover:text-foreground">Products</Link>
                    <Link href="/admin/live-control" className="text-muted-foreground transition-colors hover:text-foreground">Live Control</Link>
                </nav>
                <Sheet>
                    <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
                    <SheetContent side="left">
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>Admin Panel</span></Link>
                             <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                            <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
                            <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                            <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">Inquiries</Link>
                            <Link href="/admin/messages" className="text-muted-foreground hover:text-foreground">Messages</Link>
                            <Link href="/admin/products" className="hover:text-foreground">Products</Link>
                             <Link href="/admin/live-control" className="text-muted-foreground hover:text-foreground">Live Control</Link>
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="ml-auto flex items-center gap-2">
                  <DialogTrigger asChild>
                      <Button size="sm" className="h-8 gap-1">
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Add Product
                          </span>
                      </Button>
                  </DialogTrigger>
                   <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar className="h-9 w-9"><AvatarImage src={user?.photoURL || 'https://placehold.co/40x40.png'} /><AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback></Avatar>
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
                      <CardTitle>All Products</CardTitle>
                      <CardDescription>
                      Manage all products across the platform.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Tabs defaultValue="all">
                      <div className="flex items-center gap-4">
                          <TabsList>
                          <TabsTrigger value="all">All ({products.length})</TabsTrigger>
                          <TabsTrigger value="active">Active ({activeProducts.length})</TabsTrigger>
                          <TabsTrigger value="draft">Draft ({draftProducts.length})</TabsTrigger>
                          <TabsTrigger value="archived" className="hidden sm:flex">
                              Archived ({archivedProducts.length})
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
                          </div>
                      </div>
                      <div className="mt-4">
                          <TabsContent value="all">
                               <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onManageQna={handleManageQna} />
                          </TabsContent>
                          <TabsContent value="active">
                              <ProductTable products={activeProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onManageQna={handleManageQna} />
                          </TabsContent>
                          <TabsContent value="draft">
                              <ProductTable products={draftProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onManageQna={handleManageQna} />
                          </TabsContent>
                          <TabsContent value="archived">
                              <ProductTable products={archivedProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onManageQna={handleManageQna} />
                          </TabsContent>
                      </div>
                      </Tabs>
                  </CardContent>
              </Card>
          </main>
          <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
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
      <Dialog open={isQnaOpen} onOpenChange={setIsQnaOpen}>
        {selectedProduct && <ManageQnaDialog product={selectedProduct} />}
      </Dialog>
    </>
  )
}

    