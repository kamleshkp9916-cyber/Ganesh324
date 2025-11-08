
"use client"

import {
  File,
  PlusCircle,
  Ticket,
  ShieldCheck,
  Menu,
  MoreHorizontal,
  Trash2,
  Edit,
  CalendarIcon,
  GanttChart,
  Badge as BadgeIcon,
} from "lucide-react"

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { COUPONS_KEY, Coupon } from "@/app/admin/settings/page";
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { categories } from "@/lib/categories"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { SellerHeader } from "@/components/seller/seller-header"
import { Product } from "@/components/seller/product-form"

const couponSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(3, "Code must be at least 3 characters.").regex(/^[A-Z0-9]+$/, "Code can only contain uppercase letters and numbers."),
  description: z.string().min(5, "Description is required."),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive("Discount must be a positive number."),
  expiresAt: z.date().optional(),
  minOrderValue: z.number().optional(),
  applicableProducts: z.array(z.string()).optional(),
  maxDiscount: z.number().optional(),
  sellerId: z.string().optional(),
  sellerName: z.string().optional(),
  status: z.enum(['pending', 'active', 'rejected', 'archived']).default('active'),
  terms: z.string().optional(),
});

const CouponForm = ({ onSave, existingCoupon, closeDialog, sellerProducts }: { onSave: (coupon: Coupon) => void, existingCoupon?: Coupon, closeDialog: () => void, sellerProducts: Product[] }) => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof couponSchema>>({
        resolver: zodResolver(couponSchema),
        defaultValues: existingCoupon ? {
            ...existingCoupon,
            expiresAt: existingCoupon.expiresAt ? new Date(existingCoupon.expiresAt) : undefined,
            applicableProducts: existingCoupon.applicableProducts || []
        } : {
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: 0,
            minOrderValue: 0,
            maxDiscount: 0,
            applicableProducts: [],
            terms: "",
            status: 'active',
        },
    });

    const onSubmit = (values: z.infer<typeof couponSchema>) => {
        setIsLoading(true);
        setTimeout(() => {
            onSave({ ...values, id: existingCoupon?.id || Date.now() });
            setIsLoading(false);
            closeDialog();
        }, 500);
    };
    
    const availableProducts = useMemo(() => {
        return sellerProducts.filter(p => p.stock > 0);
    }, [sellerProducts]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="code" render={({ field }) => (
                        <FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input placeholder="e.g., MYSHOP10" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Short Description</FormLabel><FormControl><Input placeholder="e.g., 10% off on my products" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="terms" render={({ field }) => (
                    <FormItem><FormLabel>Terms & Conditions</FormLabel><FormControl><Textarea placeholder="Full terms of the offer..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="discountType" render={({ field }) => (
                        <FormItem><FormLabel>Discount Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed Amount (₹)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="discountValue" render={({ field }) => (
                        <FormItem><FormLabel>Discount Value</FormLabel><FormControl><Input type="number" placeholder="e.g., 10 or 100" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="expiresAt" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Expiration Date (Optional)</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()-1)) } initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="applicableProducts"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Applicable Products</FormLabel>
                                <FormDescription>Select which of your products this coupon will apply to. If none are selected, it will apply to all of your products.</FormDescription>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                {availableProducts.map((product) => (
                                    <FormField
                                        key={product.id}
                                        control={form.control}
                                        name="applicableProducts"
                                        render={({ field }) => {
                                        return (
                                            <FormItem key={product.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(product.id!)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...(field.value || []), product.id!])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== product.id
                                                                )
                                                                )
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">{product.name}</FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                ))}
                                 {availableProducts.length === 0 && (
                                    <p className="col-span-full text-center text-sm text-muted-foreground py-4">You have no products with available stock.</p>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter className="pt-4"><Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Coupon</Button></DialogFooter>
            </form>
        </Form>
    );
};

export default function SellerPromotionsPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);

    const [coupons, setCoupons] = useLocalStorage<Coupon[]>(COUPONS_KEY, []);
    const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
    const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
    
    const sellerCoupons = useMemo(() => {
        if (!user) return [];
        return coupons.filter(c => c.sellerId === user.uid);
    }, [coupons, user]);

    useEffect(() => {
        setIsMounted(true);
        if (userData && user) {
            const productsKey = `sellerProducts`; 
            const storedProducts = localStorage.getItem(productsKey);
            if (storedProducts) {
                // Filter products that belong to the current seller
                const allProducts = JSON.parse(storedProducts) as Product[];
                setSellerProducts(allProducts.filter(p => p.sellerId === user.uid));
            }
        }
    }, [userData, user]);


    if (!isMounted || loading || !userData) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;
    }
    
    if (userData.role !== 'seller') {
        router.push('/');
        return null;
    }

    const handleSaveCoupon = (coupon: Coupon) => {
        if (!user || !userData) return;
        setCoupons(prev => {
            const newCoupons = [...prev];
            const existingIndex = newCoupons.findIndex(c => c.id === coupon.id);
            if (existingIndex > -1) {
                newCoupons[existingIndex] = { ...coupon, sellerId: user.uid, sellerName: userData.displayName, status: 'active' };
            } else {
                newCoupons.unshift({ ...coupon, id: Date.now(), sellerId: user.uid, sellerName: userData.displayName, status: 'active' });
            }
            return newCoupons;
        });
        toast({ title: "Coupon Saved!", description: `Coupon ${coupon.code} is now active.` });
    };

    const handleDeleteCoupon = (couponId: number) => {
        setCoupons(prev => prev.filter(c => c.id !== couponId));
        toast({ title: "Coupon Deleted!", variant: "destructive" });
    };

    const openCouponForm = (coupon?: Coupon) => {
        setEditingCoupon(coupon);
        setIsCouponFormOpen(true);
    };

    return (
        <Dialog open={isCouponFormOpen} onOpenChange={setIsCouponFormOpen}>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <SellerHeader />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>My Promotions</CardTitle>
                            <CardDescription>Create and manage your discount coupons.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {sellerCoupons.length > 0 ? sellerCoupons.map(coupon => (
                                <div key={coupon.id} className={cn("flex items-center justify-between rounded-lg border p-4")}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                            <Ticket className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{coupon.code}</h4>
                                                 <Badge variant={
                                                    coupon.status === 'active' ? 'success' :
                                                    coupon.status === 'pending' ? 'warning' : 'destructive'
                                                }>{coupon.status}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{coupon.description}</p>
                                            {coupon.expiresAt && <p className="text-xs mt-1 text-muted-foreground">Expires on: {format(new Date(coupon.expiresAt), 'PPP')}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openCouponForm(coupon)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCoupon(coupon.id!)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground py-8">You haven't created any coupons yet.</p>
                            )}
                        </CardContent>
                          <CardFooter className="border-t pt-6">
                            <Button size="sm" onClick={() => openCouponForm()}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Create Coupon
                            </Button>
                        </CardFooter>
                    </Card>
                </main>
            </div>
             <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingCoupon ? 'Edit' : 'Create'} Coupon</DialogTitle>
                    <DialogDescription>
                        {editingCoupon ? 'Edit your coupon details. Your coupon will be active immediately.' : 'Fill in the details for your new coupon. It will become active as soon as you save it.'}
                    </DialogDescription>
                </DialogHeader>
                <CouponForm onSave={handleSaveCoupon} existingCoupon={editingCoupon} closeDialog={() => setIsCouponFormOpen(false)} sellerProducts={sellerProducts} />
            </DialogContent>
        </Dialog>
    )
}

    