
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
  Loader2
} from "lucide-react";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';

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
                <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{product.stock < 5 ? 'High' : 'Med'}</div><p className="text-xs text-muted-foreground">Demand</p></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-2xl font-bold">₹{product.price}</div><p className="text-xs text-muted-foreground">Unit Price</p></CardContent></Card>
            </div>
        </div>
    </div>
  );
};


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
      setLoading(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveProduct = async (productData: Product) => {
    if (!user) return;
    setIsSaving(true);
    try {
        const colRef = collection(getFirestoreDb(), 'users', user.uid, 'products');
        
        if (editingProduct) {
            await updateDoc(doc(colRef, productData.id), {
                ...productData,
                updatedAt: serverTimestamp()
            });
            toast({ title: "Success", description: "Product updated" });
        } else {
            await addDoc(colRef, {
                ...productData,
                createdAt: serverTimestamp(),
                sold: 0
            });
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

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  if (!user) return <div className="flex h-screen items-center justify-center text-slate-500">Please sign in to view dashboard.</div>;

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
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 gap-1 bg-white"
                            onClick={() => {
                                const next = !stockFilter.includes('outOfStock');
                                setStockFilter(next ? ['inStock', 'outOfStock'] : ['inStock']);
                            }}
                        >
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                              {stockFilter.includes('outOfStock') ? 'All Stock' : 'In Stock Only'}
                          </span>
                        </Button>
                        
                        <Button 
                            size="sm" 
                            className="h-9 gap-1"
                            onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                        >
                             <Plus className="h-3.5 w-3.5" />
                             <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Product</span>
                        </Button>
                    </div>
                 </div>

                 <div className="w-full">
                    <div className="bg-white border p-1 h-10 mb-4 w-full sm:w-auto inline-flex rounded-lg shadow-sm">
                        {['all', 'active', 'draft', 'archived'].map(tab => (
                             <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1 text-sm font-medium rounded-md capitalize transition-all duration-200 ${
                                    activeTab === tab 
                                    ? 'bg-slate-100 text-slate-900 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                             >
                                {tab}
                             </button>
                        ))}
                    </div>
                    
                    <Card className="border-none shadow-sm overflow-hidden bg-white">
                        <CardContent className="p-0">
                        <div className="w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-slate-50/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">Image</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[300px]">Product</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Price</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Stock</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right pr-6">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                {filterProducts.length > 0 ? filterProducts.map(product => (
                                    <tr key={product.id} className="border-b transition-colors hover:bg-slate-50/50 group">
                                    <td className="p-4 align-middle">
                                        <div className="block w-12 h-12 relative overflow-hidden rounded-lg border bg-slate-100">
                                        {product.media && product.media.length > 0 ? (
                                            <img
                                            alt={product.name}
                                            className="object-cover w-full h-full"
                                            src={product.media[0].url}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon className="h-5 w-5" />
                                            </div>
                                        )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 line-clamp-1">{product.name}</span>
                                            <span className="text-xs text-slate-500 capitalize">
                                                {product.category || "Uncategorized"} {product.brand ? `• ${product.brand}` : ""}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Badge variant={product.status === 'active' ? 'default' : product.status === 'draft' ? 'secondary' : 'outline'} className="capitalize">
                                            {product.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle text-right font-medium text-slate-700">
                                        ₹{product.price?.toLocaleString()}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <span className={`font-medium ${product.stock === 0 ? "text-red-600" : "text-slate-600"}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedProduct(product); setIsAnalyticsOpen(true); }} title="Analytics">
                                                <Eye className="w-4 h-4 text-slate-500"/>
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedProduct(product); setIsQnaOpen(true); }} title="Q&A">
                                                <MessageSquare className="w-4 h-4 text-slate-500"/>
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingProduct(product); setIsFormOpen(true); }} title="Edit">
                                                <File className="w-4 h-4 text-slate-500"/>
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteProduct(product.id)} title="Delete">
                                                <Trash2 className="w-4 h-4 text-slate-500"/>
                                            </Button>
                                        </div>
                                    </td>
                                    </tr>
                                )) : (
                                    <tr>
                                    <td colSpan={6} className="p-4 align-middle h-[300px]">
                                        <div className="flex flex-col items-center justify-center text-center h-full">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                <Search className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs mt-1">
                                                Try adjusting your filters or add a new product to get started.
                                            </p>
                                        </div>
                                    </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t px-6 py-4">
                        <div className="text-xs text-muted-foreground w-full text-center sm:text-left">
                            Showing <strong>{filterProducts.length}</strong> products
                        </div>
                        </CardFooter>
                    </Card>
                 </div>
              </div>
          </main>
        </div>

        {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-3xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                    <div className="p-6 border-b bg-slate-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                                <p className="text-sm text-slate-500">{editingProduct ? "Update product details." : "Create a new listing."}</p>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        <ProductForm 
                            onSave={handleSaveProduct} 
                            productToEdit={editingProduct} 
                            onCancel={() => setIsFormOpen(false)}
                            isSaving={isSaving}
                        />
                    </div>
                </div>
            </div>
        )}

        {selectedProduct && (
            <>
                <ManageQnaDialog 
                    product={selectedProduct} 
                    isOpen={isQnaOpen} 
                    onClose={() => setIsQnaOpen(false)}
                />
                <ProductAnalyticsDialog 
                    product={selectedProduct} 
                    isOpen={isAnalyticsOpen} 
                    onClose={() => setIsAnalyticsOpen(false)}
                />
            </>
        )}
    </>
  )
}
