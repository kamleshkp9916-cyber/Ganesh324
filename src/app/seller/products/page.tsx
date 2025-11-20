
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  File,
  Plus,
  MoreHorizontal,
  ListFilter,
  ImageIcon,
  HelpCircle,
  Eye,
  ShoppingCart,
  DollarSign,
  Package,
  Search,
  ArrowUpRight,
  MessageSquare,
  Trash2,
  X,
  Save,
  Bell,
  Loader2,
  PlusCircle, // Added missing import
} from "lucide-react";
import { getFirestore, collection, onSnapshot, addDoc, setDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SellerHeader } from '@/components/seller/seller-header';
import { Product, ProductForm } from '@/components/seller/product-form';
import { getFirestoreDb } from '@/lib/firebase-db';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';


const ManageQnaDialog = ({ product, isOpen, onClose }: { product: Product, isOpen: boolean, onClose: () => void }) => {
  const [qna, setQna] = useState([
      { id: 1, question: "Does this come with warranty?", questioner: "Alice", answer: "Yes, 1 year.", answerer: "Seller" },
      { id: 2, question: "Is shipping free?", questioner: "Bob", answer: null, answerer: null }
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
       <div className="bg-white w-full max-w-2xl h-[80vh] rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6 border-b bg-slate-50 flex justify-between items-start">
            <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Q&A Management
                </h2>
                <p className="text-sm text-slate-500">Questions for <span className="font-semibold text-slate-900">{product.name}</span></p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-grow overflow-y-auto bg-slate-50/50 p-6 space-y-4">
            {qna.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="font-medium text-slate-900">{item.question}</p>
                    <p className="text-xs text-slate-500 mb-2">Asked by {item.questioner}</p>
                    {item.answer ? (
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">{item.answer}</div>
                    ) : (
                        <div className="flex gap-2 mt-2">
                            <Input placeholder="Type answer..." className="h-8 text-xs" />
                            <Button size="sm" className="h-8">Reply</Button>
                        </div>
                    )}
                </div>
            ))}
          </div>
       </div>
    </div>
  );
};

const ProductAnalyticsDialog = ({ product, isOpen, onClose }: { product: Product, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-md">
                        <Package className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Analytics Overview</h2>
                        <p className="text-sm text-slate-500">Performance for {product.name}</p>
                    </div>
                </div>
                <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card><CardContent className="pt-6"><div className="text-2xl font-bold">12k</div><p className="text-xs text-muted-foreground">Views</p></CardContent></Card>
                 <Card><CardContent className="pt-6"><div className="text-2xl font-bold">890</div><p className="text-xs text-muted-foreground">Cart Adds</p></CardContent></Card>
                 <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{product.stock && product.stock < 5 ? 'High' : 'Med'}</div><p className="text-xs text-muted-foreground">Demand</p></CardContent></Card>
                 <Card><CardContent className="pt-6"><div className="text-2xl font-bold">₹{product.price}</div><p className="text-xs text-muted-foreground">Unit Price</p></CardContent></Card>
            </div>
        </div>
    </div>
  );
};

const ProductTable = ({ products, onEdit, onDelete, onManageQna, onAnalytics }: { products: Product[], onEdit: (product: Product) => void, onDelete: (productId: string) => void, onManageQna: (product: Product) => void, onAnalytics: (product: Product) => void }) => (
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
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
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
                      <DropdownMenuItem onSelect={() => onAnalytics(product)}>Analytics</DropdownMenuItem>
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
          Showing <strong>{products.length > 10 ? 10 : products.length}</strong> of <strong>{products.length}</strong> products
        </div>
      </CardFooter>
    </Card>
);

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQnaOpen, setIsQnaOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [stockFilter, setStockFilter] = useState(['inStock', 'outOfStock']);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const db = getFirestoreDb();
    const q = query(collection(db, 'users', user.uid, 'products'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setProducts(fetched);
      localStorage.setItem('sellerProducts', JSON.stringify(fetched));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filterProducts = useMemo(() => {
      let filtered = products;
      if (activeTab !== 'all') {
          filtered = filtered.filter(p => p.status === activeTab);
      }
      
      if (stockFilter.length === 1) {
          if (stockFilter.includes('inStock')) filtered = filtered.filter(p => p.stock > 0);
          if (stockFilter.includes('outOfStock')) filtered = filtered.filter(p => p.stock === 0);
      }
      return filtered;
  }, [products, activeTab, stockFilter]);

  const activeProducts = useMemo(() => filterProducts.filter(p => p.status === 'active'), [filterProducts]);
  const draftProducts = useMemo(() => filterProducts.filter(p => p.status === 'draft'), [filterProducts]);
  const archivedProducts = useMemo(() => filterProducts.filter(p => p.status === 'archived'), [filterProducts]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  if (!user) return <div className="flex h-screen items-center justify-center text-slate-500">Please sign in to view dashboard.</div>;

  const handleSaveProduct = async (productData: Product) => {
    if (!user) return;
    setIsSaving(true);
    try {
        const db = getFirestoreDb();
        const storage = getStorage();
        const colRef = collection(db, 'users', user.uid, 'products');

        const uploadMedia = async (mediaItem: { type: 'video' | 'image'; file?: File; url: string }, productId: string) => {
            if (mediaItem.file && mediaItem.url.startsWith('data:')) {
                const filePath = `products/${user.uid}/${productId}/${mediaItem.file.name}`;
                const storageRef = ref(storage, filePath);
                const uploadResult = await uploadString(storageRef, mediaItem.url, 'data_url');
                return getDownloadURL(uploadResult.ref);
            }
            return mediaItem.url; // Already a URL
        };
        
        let productId = editingProduct ? productData.id! : doc(colRef).id;

        const mediaUrls = await Promise.all(
            (productData.media || []).map(item => uploadMedia(item, productId))
        );
        
        const finalMedia = (productData.media || []).map((item, index) => ({
            type: item.type,
            url: mediaUrls[index]
        }));
        
        const dataToSave = {
            ...productData,
            key: productId, // Use firestore generated key as our key
            media: finalMedia,
        };

        if (editingProduct) {
            await setDoc(doc(colRef, productId), { ...dataToSave, updatedAt: serverTimestamp() }, { merge: true });
            toast({ title: "Success", description: "Product updated" });
        } else {
            await setDoc(doc(colRef, productId), { ...dataToSave, createdAt: serverTimestamp(), sold: 0 });
            toast({ title: "Success", description: "Product created" });
        }

        setIsFormOpen(false);
        setEditingProduct(null);
    } catch (error) {
        console.error("Save error:", error);
        toast({ title: "Error", description: "Failed to save product" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
      if(!user) return;
      if(!confirm("Are you sure you want to delete this product?")) return;

      try {
          await deleteDoc(doc(getFirestoreDb(), 'users', user.uid, 'products', productId));
          toast({ title: "Deleted", description: "Product removed" });
      } catch (e) {
          console.error("Delete error:", e);
      }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setEditingProduct(null);
    }
    setIsFormOpen(open);
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleManageQna = (product: Product) => {
    setSelectedProduct(product);
    setIsQnaOpen(true);
  };
  
  const handleAnalytics = (product: Product) => {
    setSelectedProduct(product);
    setIsAnalyticsOpen(true);
  };

  const handleStockFilterChange = (filter: 'inStock' | 'outOfStock') => {
    setStockFilter(prev => {
        const newFilters = prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter];
        return newFilters.length === 0 ? ['inStock', 'outOfStock'] : newFilters;
    });
  };
  
  const handleExport = () => {
    const dataToExport = filterProducts;
    if (dataToExport.length === 0) {
        toast({ title: "No Data", description: "There is no data to export.", variant: "destructive"});
        return;
    }

    const headers = ["ID", "Name", "Status", "Price", "Stock", "Category", "Sub-category", "Brand"];
    const rows = dataToExport.map(p => [
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
  };
  
  return (
    <>
        <div className="flex min-h-screen w-full flex-col bg-slate-50/50 font-sans text-slate-900">
           <SellerHeader />
           <main className="flex-1 p-4 sm:px-6 sm:py-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                 <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                       <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                       <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                       <div className="text-2xl font-bold text-slate-900">{products.length}</div>
                       <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
                    </CardContent>
                 </Card>
                 <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                       <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
                       <Eye className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                       <div className="text-2xl font-bold text-slate-900">{products.filter(p => p.status === 'active').length}</div>
                       <p className="text-xs text-muted-foreground mt-1">Currently visible</p>
                    </CardContent>
                 </Card>
                 <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                       <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
                       <ArrowUpRight className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                       <div className="text-2xl font-bold text-slate-900">{products.filter(p => p.stock < 5 && p.stock > 0).length}</div>
                       <p className="text-xs text-muted-foreground mt-1">Less than 5 units</p>
                    </CardContent>
                 </Card>
              </div>

              <div className="flex flex-col gap-6">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                       <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h2>
                       <p className="text-muted-foreground text-sm">Manage your products and stock levels.</p>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 gap-1 bg-white">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
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
                        <Button size="sm" variant="outline" className="h-9 gap-1 bg-white" onClick={handleExport}>
                            <File className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                        </Button>
                         <Button size="sm" className="h-9 gap-1 bg-slate-900 hover:bg-slate-800 text-white shadow-md" onClick={() => { setEditingProduct(undefined); setIsFormOpen(true); }}>
                             <PlusCircle className="h-3.5 w-3.5" />
                             <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Product</span>
                        </Button>
                    </div>
                 </div>

                 <div className="w-full">
                    <Tabs defaultValue="all" onValueChange={setActiveTab}>
                      <TabsList>
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="active">Active</TabsTrigger>
                          <TabsTrigger value="draft">Draft</TabsTrigger>
                          <TabsTrigger value="archived" className="hidden sm:flex">
                              Archived
                          </TabsTrigger>
                      </TabsList>
                      <div className="mt-4">
                          <TabsContent value="all">
                               <ProductTable products={filterProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onManageQna={handleManageQna} onAnalytics={handleAnalytics}/>
                          </TabsContent>
                          <TabsContent value="active">
                              <ProductTable products={activeProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onManageQna={handleManageQna} onAnalytics={handleAnalytics}/>
                          </TabsContent>
                          <TabsContent value="draft">
                              <ProductTable products={draftProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onManageQna={handleManageQna} onAnalytics={handleAnalytics}/>
                          </TabsContent>
                          <TabsContent value="archived">
                              <ProductTable products={archivedProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onManageQna={handleManageQna} onAnalytics={handleAnalytics}/>
                          </TabsContent>
                      </div>
                    </Tabs>
                 </div>
              </div>
          </main>
        </div>

        <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
             <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                    <DialogDescription>
                        {editingProduct ? "Update the details of your product." : "Fill in the details to add a new product to your store."}
                    </DialogDescription>
                </DialogHeader>
                <ProductForm onSave={handleSaveProduct} productToEdit={editingProduct} onCancel={() => handleOpenChange(false)} isSaving={isSaving} />
            </DialogContent>
        </Dialog>
        
        <Dialog open={isQnaOpen} onOpenChange={setIsQnaOpen}>
            {selectedProduct && <ManageQnaDialog product={selectedProduct} isOpen={isQnaOpen} onClose={() => setIsQnaOpen(false)} />}
        </Dialog>
        <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
            {selectedProduct && <ProductAnalyticsDialog product={selectedProduct} isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />}
        </Dialog>
    </>
  )
}
