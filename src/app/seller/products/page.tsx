
"use client"

import {
  File,
  PlusCircle,
  MoreHorizontal,
  ListFilter,
  ImageIcon,
  MessageSquare,
  HelpCircle,
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
} from "@/components/ui/dialog"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { ProductForm, Product } from "@/components/seller/product-form"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { SellerHeader } from "@/components/seller/seller-header"
import { collection, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore"
import { getFirestoreDb } from "@/lib/firebase"


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
              <TableRow key={product.id}>
                <TableCell className="hidden sm:table-cell">
                  <Link href={`/product/${product.key}`}>
                    {product.media && product.media.length > 0 ? (
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.media[0].url}
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

export default function SellerProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isQnaOpen, setIsQnaOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stockFilter, setStockFilter] = useState<('inStock' | 'outOfStock')[]>(['inStock', 'outOfStock']);
    const { toast } = useToast();

    useEffect(() => {
        setIsMounted(true);
        if (user) {
            const db = getFirestoreDb();
            const q = query(collection(db, "users", user.uid, "products"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedProducts: Product[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
                });
                setProducts(fetchedProducts);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const filterProductsByStock = (products: Product[]) => {
        if (stockFilter.length === 2 || stockFilter.length === 0) {
            return products;
        }
        if (stockFilter.includes('inStock')) {
            return products.filter(p => p.stock > 0);
        }
        if (stockFilter.includes('outOfStock')) {
            return products.filter(p => p.stock === 0);
        }
        return [];
    };

    const activeProducts = useMemo(() => filterProductsByStock(products.filter(p => p.status === 'active')), [products, stockFilter]);
    const draftProducts = useMemo(() => filterProductsByStock(products.filter(p => p.status === 'draft')), [products, stockFilter]);
    const archivedProducts = useMemo(() => filterProductsByStock(products.filter(p => p.status === 'archived')), [products, stockFilter]);
    const allFilteredProducts = useMemo(() => filterProductsByStock(products), [products, stockFilter]);

    if (!isMounted || loading) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
    }

    if (!user) {
        router.push('/');
        return null;
    }

    const handleSaveProduct = (product: Product) => {
        setIsFormOpen(false);
        setEditingProduct(undefined);
    };
    
    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!user) return;
        const db = getFirestoreDb();
        try {
            await deleteDoc(doc(db, "users", user.uid, "products", productId));
            toast({
                title: "Product Deleted",
                description: "The product has been successfully removed.",
            });
        } catch (error) {
            console.error("Error deleting product:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not delete the product.",
            });
        }
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

    const handleStockFilterChange = (filter: 'inStock' | 'outOfStock') => {
        setStockFilter(prev => {
            const newFilters = prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter];
            return newFilters.length === 0 ? ['inStock', 'outOfStock'] : newFilters;
        });
    };
    
    const handleExport = () => {
        if (allFilteredProducts.length === 0) {
            toast({ title: "No data to export", variant: "destructive" });
            return;
        }

        const headers = ["ID", "Name", "Status", "Price", "Stock", "Category", "Sub-category", "Brand"];
        const rows = allFilteredProducts.map(p => [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            p.status,
            p.price,
            p.stock,
            p.category || "",
            p.subcategory || "",
            p.brand || ""
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `products_export_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Export Started", description: "Your products CSV is downloading." });
    };
  
  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
           <SellerHeader />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>
                            Manage your products and view their sales performance.
                            </CardDescription>
                        </div>
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
                                    <DropdownMenuLabel>Filter by Stock</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem checked={stockFilter.includes('inStock')} onCheckedChange={() => handleStockFilterChange('inStock')}>
                                        In Stock
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={stockFilter.includes('outOfStock')} onCheckedChange={() => handleStockFilterChange('outOfStock')}>
                                        Out of Stock
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
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
                  </CardHeader>
                  <CardContent>
                      <Tabs defaultValue="all">
                      <div className="flex items-center gap-4">
                          <TabsList>
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="active">Active</TabsTrigger>
                          <TabsTrigger value="draft">Draft</TabsTrigger>
                          <TabsTrigger value="archived" className="hidden sm:flex">
                              Archived
                          </TabsTrigger>
                          </TabsList>
                      </div>
                      <div className="mt-4">
                          <TabsContent value="all">
                               <ProductTable products={allFilteredProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onManageQna={handleManageQna} />
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
        </div>
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                  {editingProduct ? "Update the details of your product." : "Fill in the details to add a new product to your store."}
              </DialogDescription>
          </DialogHeader>
          <ProductForm onSave={handleSaveProduct} productToEdit={editingProduct} />
        </DialogContent>
      </Dialog>
      <Dialog open={isQnaOpen} onOpenChange={setIsQnaOpen}>
        {selectedProduct && <ManageQnaDialog product={selectedProduct} />}
      </Dialog>
    </>
  )
}

    