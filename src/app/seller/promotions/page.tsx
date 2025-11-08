
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SellerHeader } from "@/components/seller/seller-header";
import { BarChart, Flame, PlusCircle, Rocket, Sparkles, Star, Ticket } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { productDetails } from "@/lib/product-data";
import { Separator } from "@/components/ui/separator";

export const COUPONS_KEY = 'streamcart_coupons';

const couponSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(3, "Code must be at least 3 characters.").regex(/^[A-Z0-9]+$/, "Code can only contain uppercase letters and numbers."),
  description: z.string().min(5, "Description is required."),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive("Discount must be a positive number."),
  expiresAt: z.date().optional(),
  minOrderValue: z.number().optional(),
  applicableProducts: z.array(z.string()).optional(),
});

export type Coupon = z.infer<typeof couponSchema>;

const promotionTiers = [
    {
        name: "Category Spotlight",
        price: "₹1,500/day",
        description: "Feature your product at the top of a specific category page.",
        features: ["Top-of-page placement", "Increased visibility in one category", "Great for targeted exposure"],
        icon: <Sparkles className="h-6 w-6" />,
    },
    {
        name: "Homepage Banner",
        price: "₹5,000/day",
        description: "Get your brand seen by everyone on the main live shopping page.",
        features: ["Premium homepage banner slot", "Maximum brand exposure", "Drives traffic to your profile & streams"],
        icon: <Rocket className="h-6 w-6" />,
    },
    {
        name: "Trending Boost",
        price: "₹2,500/day",
        description: "Boost your product's ranking in the 'Trending' section.",
        features: ["Higher placement on the Trending page", "Ideal for hot, new items", "Capture impulse buyers"],
        icon: <Flame className="h-6 w-6" />,
    },
];

const initialCoupons: Coupon[] = [
    { id: 1, code: 'SELLER10', description: '10% off on all my products', discountType: 'percentage', discountValue: 10 },
];

const CouponForm = ({ onSave, existingCoupon, closeDialog }: { onSave: (coupon: Coupon) => void, existingCoupon?: Coupon, closeDialog: () => void }) => {
    const { user } = useAuth();
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const allProducts = Object.values(productDetails);
            const userProducts = allProducts.filter(p => p.brand === user.displayName); // Simple mock filter
            setSellerProducts(userProducts.filter(p => p.stock > 0));
        }
    }, [user]);

    const form = useForm<z.infer<typeof couponSchema>>({
        resolver: zodResolver(couponSchema),
        defaultValues: existingCoupon || {
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: 0,
            minOrderValue: 0,
            applicableProducts: [],
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="code" render={({ field }) => (
                        <FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input placeholder="e.g., SALE10" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Short Description</FormLabel><FormControl><Input placeholder="e.g., 10% off electronics" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
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
                <FormField control={form.control} name="minOrderValue" render={({ field }) => (
                    <FormItem><FormLabel>Min. Order Value (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormDescription>Leave as 0 for no minimum.</FormDescription><FormMessage /></FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="applicableProducts"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Applicable Products</FormLabel>
                                <FormDescription>Select which of your products this coupon will apply to. If none are selected, it will apply to all.</FormDescription>
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-2 border p-2 rounded-md">
                                {sellerProducts.map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="applicableProducts"
                                        render={({ field }) => {
                                        return (
                                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...(field.value || []), item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                                )
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">{item.name}</FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                ))}
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
    const [coupons, setCoupons] = useLocalStorage<Coupon[]>(COUPONS_KEY, initialCoupons);
    const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
    const { toast } = useToast();

    const handleSaveCoupon = (coupon: Coupon) => {
        setCoupons(prev => {
            const newCoupons = [...prev];
            const existingIndex = newCoupons.findIndex(c => c.id === coupon.id);
            if (existingIndex > -1) {
                newCoupons[existingIndex] = coupon;
            } else {
                newCoupons.unshift(coupon);
            }
            return newCoupons;
        });
        toast({ title: "Coupon Saved!", description: `Coupon ${coupon.code} has been updated.` });
    };

    const handleDeleteCoupon = (couponId: number) => {
        setCoupons(prev => prev.filter(c => c.id !== couponId));
        toast({ title: "Coupon Deleted", variant: "destructive" });
    };
    
    const openCouponForm = (coupon?: Coupon) => {
        setEditingCoupon(coupon);
        setIsCouponFormOpen(true);
    };

    return (
        <Dialog open={isCouponFormOpen} onOpenChange={setIsCouponFormOpen}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <SellerHeader />
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 md:p-8">
                 <Tabs defaultValue="sponsored">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="coupons">Offers & Coupons</TabsTrigger>
                        <TabsTrigger value="sponsored">Sponsored Products</TabsTrigger>
                    </TabsList>
                    <TabsContent value="coupons" className="mt-6">
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Your Coupons</CardTitle>
                                    <CardDescription>Create and manage discount codes for your products.</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => openCouponForm()}><PlusCircle className="mr-2 h-4 w-4" />Create Coupon</Button>
                            </CardHeader>
                             <CardContent>
                                <div className="space-y-4">
                                {coupons.map(coupon => (
                                    <div key={coupon.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                                <Ticket className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{coupon.code}</h4>
                                                <p className="text-xs text-muted-foreground">{coupon.description}</p>
                                                 {coupon.expiresAt && <p className="text-xs text-muted-foreground mt-1">Expires on: {format(new Date(coupon.expiresAt), 'PPP')}</p>}
                                            </div>
                                        </div>
                                         <Button variant="outline" size="sm" onClick={() => openCouponForm(coupon)}>Manage</Button>
                                    </div>
                                ))}
                                {coupons.length === 0 && (
                                    <div className="text-center text-muted-foreground py-12">
                                        <p>You haven't created any coupons yet.</p>
                                    </div>
                                )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="sponsored" className="mt-6">
                        <div>
                            <CardHeader className="px-0">
                                <CardTitle>Sponsor Your Products</CardTitle>
                                <CardDescription>
                                    Purchase promotional packages to feature your products across the platform and reach more customers.
                                </CardDescription>
                            </CardHeader>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {promotionTiers.map(tier => (
                                    <Card key={tier.name} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="bg-primary/10 p-3 rounded-full">{tier.icon}</div>
                                                <CardTitle className="text-xl">{tier.name}</CardTitle>
                                            </div>
                                            <p className="text-3xl font-bold">{tier.price}</p>
                                            <CardDescription>{tier.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                {tier.features.map(feat => (
                                                    <li key={feat} className="flex items-center gap-2">
                                                        <Star className="h-4 w-4 text-primary fill-primary" />
                                                        <span>{feat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full">
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Create Promotion
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
        <DialogContent className="max-w-2xl">
             <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Edit' : 'Add New'} Coupon</DialogTitle>
                <DialogDescription>Fill in the details for the discount coupon.</DialogDescription>
            </DialogHeader>
            <CouponForm onSave={handleSaveCoupon} existingCoupon={editingCoupon} closeDialog={() => setIsCouponFormOpen(false)} />
        </DialogContent>
        </Dialog>
    );
}
