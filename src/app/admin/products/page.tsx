
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
  AlertTriangle,
  Send,
  User,
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
import { productDetails, productToSellerMapping } from "@/lib/product-data"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"


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
    sellerId?: string;
    views?: number;
    sold?: number;
    keywords?: string;
}

const initialProducts: Product[] = Object.values(productDetails).map(p => ({
    ...p,
    id: p.key,
    price: parseFloat(p.price.replace(/[^0-9.-]+/g, "")),
    images: p.images.map(img => ({ preview: img })),
    seller: productToSellerMapping[p.key as keyof typeof productToSellerMapping]?.name || 'N/A',
    sellerId: productToSellerMapping[p.key as keyof typeof productToSellerMapping]?.uid || 'N/A',
    status: p.stock > 0 ? 'active' : 'archived', // Simplified status logic
}));

const ProductTable = ({ products, onViewDetails }: { products: Product[], onViewDetails: (product: Product) => void }) => (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
            A global view of all active products on the platform. Click a row to see details.
        </CardDescription>
      </CardHeader>
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
                         <Link href={`/admin/users/${product.sellerId}`} onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:underline">
                            {product.seller}
                         </Link>
                    ): (
                        <span className="text-muted-foreground">N/A</span>
                    )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === 'active' ? 'success' : 'outline'}>{product.status}</Badge>
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

const ProductDetailView = ({ product, onBack, onUpdateStatus }: { product: Product, onBack: () => void, onUpdateStatus: (id: string, status: 'active' | 'archived') => void }) => {
    const grossRevenue = (product.sold || 0) * product.price;
    const platformFee = grossRevenue * 0.03; // 3% platform fee
    const netRevenue = grossRevenue - platformFee;

    const mockReports = [
        { id: 1, reason: "Inaccurate Description", reportedBy: "user_xyz" },
        { id: 2, reason: "Misleading Image", reportedBy: "user_abc" },
    ];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Products</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
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
                        {product.keywords && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.keywords.split(',').map((kw, i) => (
                                        <Badge key={i} variant="secondary">{kw.trim()}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-6">
                        <div>
                            <Badge variant="secondary">{product.key}</Badge>
                            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
                            <p className="text-muted-foreground mt-2">{product.description}</p>
                        </div>
                         <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                            <div><span className="font-semibold text-muted-foreground">Price:</span><br/> ₹{product.price.toLocaleString()}</div>
                            <div><span className="font-semibold text-muted-foreground">Stock:</span><br/> {product.stock}</div>
                            <div><span className="font-semibold text-muted-foreground">Seller:</span><br/> <Link href={`/admin/users/${product.sellerId}`} className="text-primary hover:underline">{product.seller || 'N/A'}</Link></div>
                            <div><span className="font-semibold text-muted-foreground">Status:</span><br/> <Badge variant={product.status === 'active' ? 'success' : 'outline'}>{product.status}</Badge></div>
                        </div>
                         <Card className="bg-muted/40">
                             <CardHeader className="pb-2">
                                <CardTitle className="text-base">Analytics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                    <div><p className="text-2xl font-bold">{product.views?.toLocaleString() || 0}</p><p className="text-xs text-muted-foreground">Views</p></div>
                                    <div><p className="text-2xl font-bold">{product.sold?.toLocaleString() || 0}</p><p className="text-xs text-muted-foreground">Sales</p></div>
                                </div>
                                <div className="border-t pt-3 mt-3">
                                    <h4 className="font-semibold mb-2 text-sm">Revenue Breakdown</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Gross Revenue:</span><span>₹{grossRevenue.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (3%):</span><span className="text-destructive">- ₹{platformFee.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                                        <div className="flex justify-between font-bold"><span className="text-muted-foreground">Net Revenue:</span><span>₹{netRevenue.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Product Reports</CardTitle>
                                <CardDescription>Reports submitted by users for this product.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {mockReports.map((report) => (
                                    <div key={report.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                        <div>
                                            <p className="font-medium">{report.reason}</p>
                                            <p className="text-xs text-muted-foreground">Reported by: {report.reportedBy}</p>
                                        </div>
                                    </div>
                                ))}
                                {mockReports.length === 0 && <p className="text-center text-muted-foreground text-xs py-4">No reports for this product.</p>}
                            </CardContent>
                             <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary" size="sm">Request Correction</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Request Correction from Seller</DialogTitle>
                                            <DialogDescription>Send a message to {product.seller} detailing the required changes.</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="correction-message">Message</Label>
                                            <Textarea id="correction-message" placeholder="e.g., 'Please update the product images to be more accurate...'"/>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="ghost">Cancel</Button>
                                            </DialogClose>
                                            <Button><Send className="mr-2 h-4 w-4"/>Send Message</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">Suspend Product</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will archive the product and make it unavailable for purchase. The seller will be notified.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onUpdateStatus(product.id, 'archived')}>Confirm Suspension</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function AdminProductsPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [allProducts, setAllProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const activeProducts = useMemo(() => {
        let products = allProducts.filter(p => p.status === 'active');
        if (debouncedSearchTerm) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                (p.key && p.key.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
                (p.seller && p.seller.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            );
        }
        return products;
    }, [allProducts, debouncedSearchTerm]);
    
    const handleUpdateStatus = (productId: string, status: 'active' | 'archived') => {
        setAllProducts(prev => prev.map(p => p.id === productId ? {...p, status} : p));
        setSelectedProduct(prev => prev && prev.id === productId ? {...prev, status} : prev);
    }

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
                    <ProductDetailView product={selectedProduct} onBack={() => setSelectedProduct(null)} onUpdateStatus={handleUpdateStatus}/>
                </main>
            </AdminLayout>
        );
    }
  
  return (
    <AdminLayout>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <ProductTable products={activeProducts} onViewDetails={setSelectedProduct} />
        </main>
    </AdminLayout>
  )
}

    