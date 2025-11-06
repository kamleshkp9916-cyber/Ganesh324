

"use client"

import {
  ShieldCheck,
  Menu,
  MessageSquare,
  Mail,
  MoreHorizontal,
  Eye,
  Archive,
  ChevronLeft,
  ChevronRight,
  Annoyed,
  Send,
  Loader2,
  FileText,
  Shield,
  Flag,
  Trash2,
  Edit,
  PlusCircle,
  UploadCloud,
  Image as ImageIcon,
  CalendarIcon,
  Ticket,
  Contact,
  Info,
  Link2,
  Truck,
  GanttChart,
  Check,
  X,
  Clock,
  LayoutGrid,
  Wallet,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useRef, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, parseISO } from "date-fns"

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
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthActions } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { CATEGORIES_KEY, defaultCategories, Category, Subcategory } from "@/lib/categories";
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AddBankForm, WithdrawForm } from "@/components/settings-forms"


const FLAGGED_COMMENTS_KEY = 'streamcart_flagged_comments';
export const COUPONS_KEY = 'streamcart_coupons';
export const PROMOTIONAL_SLIDES_KEY = 'streamcart_promotional_slides';
export const CATEGORY_BANNERS_KEY = 'streamcart_category_banners';
export const FOOTER_CONTENT_KEY = 'streamcart_footer_content';
export const HUB_BANNER_KEY = 'streamcart_hub_banner';
export const HUB_FEATURED_PRODUCTS_KEY = 'streamcart_hub_featured_products';
export const SHIPPING_SETTINGS_KEY = 'streamcart_shipping_settings';


const announcementSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    message: z.string().min(10, "Message must be at least 10 characters.")
})

const warningSchema = z.object({
    userId: z.string().min(1, "User ID or Email is required."),
    message: z.string().min(10, "Warning message must be at least 10 characters.")
})

const couponSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(3, "Code must be at least 3 characters.").regex(/^[A-Z0-9]+$/, "Code can only contain uppercase letters and numbers."),
  description: z.string().min(5, "Description is required."),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive("Discount must be a positive number."),
  expiresAt: z.date().optional(),
  minOrderValue: z.number().optional(),
  applicableCategories: z.array(z.string()).optional(),
  maxDiscount: z.number().optional(),
  sellerId: z.string().optional(),
  sellerName: z.string().optional(),
  status: z.enum(['pending', 'active', 'rejected', 'archived']).default('active'),
  terms: z.string().optional(),
  applicableProducts: z.array(z.string()).optional(),
});

export type Coupon = z.infer<typeof couponSchema>;

const slideSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(5, "Description is required."),
  imageUrl: z.string().url("A valid image URL is required."),
  expiresAt: z.date().optional(),
});
export type Slide = z.infer<typeof slideSchema>;

const bannerSchema = z.object({
  title: z.string().min(3, "Title is required."),
  description: z.string().min(5, "Description is required."),
  imageUrl: z.string().url("A valid image URL is required."),
});
export type CategoryBanner = z.infer<typeof bannerSchema>;

export type CategoryBanners = {
    [key: string]: {
        banner1: CategoryBanner;
        banner2: CategoryBanner;
    }
}

export type HubBanner = z.infer<typeof bannerSchema>;

const featuredProductSchema = z.object({
  imageUrl: z.string().url("A valid image URL is required."),
  name: z.string().min(3, "Product name is required."),
  model: z.string().min(1, "Model/Identifier is required."),
});
export type FeaturedProduct = z.infer<typeof featuredProductSchema>;


const footerContentSchema = z.object({
  description: z.string().min(10, "Description is required."),
  address: z.string().min(10, "Address is required."),
  phone: z.string().min(10, "Phone number is required."),
  email: z.string().email("Invalid email address."),
  facebook: z.string().url().or(z.literal("")),
  twitter: z.string().url().or(z.literal("")),
  linkedin: z.string().url().or(z.literal("")),
  instagram: z.string().url().or(z.literal("")),
});
export type FooterContent = z.infer<typeof footerContentSchema>;

const shippingSettingsSchema = z.object({
  deliveryCharge: z.coerce.number().min(0, "Charge must be non-negative."),
});
export type ShippingSettings = z.infer<typeof shippingSettingsSchema>;

const defaultFooterContent: FooterContent = {
  description: "Your one-stop shop for live shopping. Discover, engage, and buy in real-time.",
  address: "123 Stream St, Commerce City, IN",
  phone: "(+91) 98765 43210",
  email: "streamcartcom@gmail.com",
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  linkedin: "https://linkedin.com",
  instagram: "https://instagram.com",
};

const defaultShippingSettings: ShippingSettings = {
    deliveryCharge: 50.00
};

const initialFlaggedContent = [
    { id: 1, type: 'User Profile', content: 'Inappropriate bio for user "SpamBot99"', targetId: 'SpamBot99', reporter: 'AdminBot', status: 'Pending' },
    { id: 2, type: 'Product Image', content: 'Misleading image for "Magic Beans"', targetId: 'prod_1', reporter: 'JaneDoe', status: 'Pending' },
    { id: 3, type: 'Chat Message', content: 'Harassment in chat from "User123"', targetId: 'User123', reporter: 'User456', status: 'Pending' },
    { id: 4, type: 'Live Stream', content: 'Off-topic content in "GadgetGuru" stream', targetId: 'GadgetGuru', reporter: 'CommunityMod', status: 'Reviewed' },
];

const initialCoupons: Coupon[] = [
    { id: 1, code: 'STREAM10', description: '10% off on all orders', discountType: 'percentage', discountValue: 10, expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)), applicableCategories: ['All'], minOrderValue: 0, status: 'active', sellerId: 'admin' },
    { id: 2, code: 'SAVE100', description: '₹100 off on orders above ₹1000', discountType: 'fixed', discountValue: 100, minOrderValue: 1000, applicableCategories: ['All'], status: 'active', sellerId: 'admin' },
    { id: 3, code: 'FREESHIP', description: 'Free shipping on all orders', discountType: 'fixed', discountValue: 0, status: 'pending', sellerId: 'seller1', sellerName: 'FashionFinds'},
];

const initialSlides: Slide[] = [
  { id: 1, imageUrl: 'https://placehold.co/1200x400.png', title: 'Flash Sale!', description: 'Up to 50% off on electronics.', expiresAt: new Date(new Date().setDate(new Date().getDate() + 3)) },
  { id: 2, imageUrl: 'https://placehold.co/1200x400.png', title: 'New Arrivals', description: 'Check out the latest fashion trends.' },
];

const defaultCategoryBanners: CategoryBanners = {
    "Women": {
        banner1: { title: '25% off', description: 'Michael Kors for her. Ends 5/15.', imageUrl: 'https://images.unsplash.com/photo-1525945367383-a90940981977?w=800&h=800&fit=crop' },
        banner2: { title: 'State of Day', description: 'Restwear, sleepwear & innerwear that takes you from sunrise to slumber.', imageUrl: 'https://images.unsplash.com/photo-1617964436152-29304c5aad3a?w=1200&h=600&fit=crop' }
    },
    "Men": {
        banner1: { title: '40% off', description: 'Top Brand Polos & Tees. Limited time only.', imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop' },
        banner2: { title: 'Activewear Collection', description: 'Engineered to keep you cool, dry, and comfortable.', imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=1200&h=600&fit=crop' }
    },
    "Kids": { banner1: { title: "Kids' Corner", description: 'Fun and stylish outfits for your little ones.', imageUrl: 'https://placehold.co/800x800.png' }, banner2: { title: 'Playtime Favorites', description: 'Durable and fun toys for all ages.', imageUrl: 'https://placehold.co/1200x600.png' } },
    "Home": { banner1: { title: 'Cozy Living', description: 'Upgrade your living space with our new home decor.', imageUrl: 'https://placehold.co/800x800.png' }, banner2: { title: 'Kitchen Essentials', description: 'Cook up a storm with our latest kitchenware.', imageUrl: 'https://placehold.co/1200x600.png' } },
    "Electronics": { banner1: { title: 'Tech Deals', description: 'Get the latest gadgets at amazing prices.', imageUrl: 'https://placehold.co/800x800.png' }, banner2: { title: 'Sound On', description: 'Experience immersive audio with our new headphones.', imageUrl: 'https://placehold.co/1200x600.png' } },
    "Shoes": { banner1: { title: 'Step Up Your Style', description: 'Find the perfect pair for any occasion.', imageUrl: 'https://placehold.co/800x800.png' }, banner2: { title: 'Comfort & Style', description: 'Sneakers, boots, and more.', imageUrl: 'https://placehold.co/1200x600.png' } },
    "Handbags": { banner1: { title: 'The Perfect Accessory', description: 'Complete your look with our new handbag collection.', imageUrl: 'https://placehold.co/800x800.png' }, banner2: { title: 'Carry It All', description: 'Stylish and functional bags for every need.', imageUrl: 'https://placehold.co/1200x600.png' } },
    "Trending": { banner1: { title: 'What\'s Hot', description: 'Discover the most popular items right now.', imageUrl: 'https://placehold.co/800x800.png' }, banner2: { title: 'Must-Haves', description: 'The products everyone is talking about.', imageUrl: 'https://placehold.co/1200x600.png' } },
    "Sale": { banner1: { title: 'Big Savings!', description: 'Up to 70% off on selected items.', imageUrl: 'https://placehold.co/800x800.png' }, banner2: { title: 'Final Clearance', description: 'Don\'t miss out on these last-chance deals.', imageUrl: 'https://placehold.co/1200x600.png' } }
};

const defaultHubBanner: HubBanner = {
    title: "Mega Electronics Sale",
    description: "Up to 40% off on all smartphones, laptops, and accessories. Limited time offer!",
    imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&h=400&fit=crop"
};

const defaultFeaturedProducts: FeaturedProduct[] = [
  { imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop', name: 'Latest Laptop', model: 'Model Pro X' },
  { imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&h=500&fit=crop', name: 'Smartphone', model: 'SmartX 12' },
  { imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', name: 'Headphones', model: 'AudioMax 3' },
];

const categorySchema = z.object({
  id: z.string().min(1, "ID is required."),
  name: z.string().min(2, "Category name is required."),
  subcategories: z.array(z.object({
    name: z.string().min(2, "Subcategory name is required."),
    description: z.string().min(5, "Description is required."),
  })).optional()
});

const CategoryForm = ({ category, onSave, onCancel }: { category: Category | null, onSave: (data: Category) => void, onCancel: () => void }) => {
    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: category || { id: '', name: '', subcategories: [] }
    });

    const { fields, append, remove } = useForm({
        control: form.control,
        name: "subcategories",
    });

    const onSubmit = (values: z.infer<typeof categorySchema>) => {
        onSave(values);
        onCancel();
    };

    return (
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>{category ? 'Edit' : 'Add New'} Category</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Category Name</FormLabel><FormControl><Input placeholder="e.g., Men" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="id" render={({ field }) => (
                        <FormItem><FormLabel>Category ID</FormLabel><FormControl><Input placeholder="e.g., men" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <h4 className="font-semibold text-sm pt-2">Subcategories</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {(fields as any[]).map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-start border p-3 rounded-lg">
                            <FormField control={form.control} name={`subcategories.${index}.name`} render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`subcategories.${index}.description`} render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive mt-5"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    </div>

                     <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', description: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Subcategory
                    </Button>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                        <Button type="submit">Save Category</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};


const CouponForm = ({ onSave, existingCoupon, closeDialog, allCategories }: { onSave: (coupon: Coupon) => void, existingCoupon?: Coupon, closeDialog: () => void, allCategories: string[] }) => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof couponSchema>>({
        resolver: zodResolver(couponSchema),
        defaultValues: existingCoupon ? {
            ...existingCoupon,
            expiresAt: existingCoupon.expiresAt ? new Date(existingCoupon.expiresAt) : undefined,
            applicableCategories: existingCoupon.applicableCategories || ['All']
        } : {
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: 0,
            minOrderValue: 0,
            maxDiscount: 0,
            applicableCategories: ['All'],
            terms: "",
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
                <Separator />
                <h4 className="font-medium text-sm">Conditions</h4>
                <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="minOrderValue" render={({ field }) => (
                        <FormItem><FormLabel>Min. Order Value (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormDescription className="text-xs">Leave as 0 for no minimum.</FormDescription><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="maxDiscount" render={({ field }) => (
                        <FormItem><FormLabel>Max. Discount (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormDescription className="text-xs">For percentage discounts.</FormDescription><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField
                    control={form.control}
                    name="applicableCategories"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Applicable Categories</FormLabel>
                                <FormDescription>Select categories where this coupon can be used. "All" applies to everything.</FormDescription>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {allCategories.map((item) => (
                                    <FormField
                                        key={item}
                                        control={form.control}
                                        name="applicableCategories"
                                        render={({ field }) => {
                                        return (
                                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...(field.value || []), item])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item
                                                                )
                                                                )
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">{item}</FormLabel>
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

const SlideForm = ({ onSave, existingSlide, closeDialog }: { onSave: (slide: Slide) => void, existingSlide?: Slide, closeDialog: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof slideSchema>>({
        resolver: zodResolver(slideSchema),
        defaultValues: existingSlide || { title: "", description: "", imageUrl: "" },
    });

    const onSubmit = (values: z.infer<typeof slideSchema>) => {
        setIsLoading(true);
        setTimeout(() => {
            onSave({ ...values, id: existingSlide?.id || Date.now() });
            setIsLoading(false);
            closeDialog();
        }, 500);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Flash Sale!" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Up to 50% off!" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="expiresAt" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Expiration Date (Optional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value): undefined} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus/></PopoverContent>
                        </Popover>
                        <FormDescription>
                            The promotion will be automatically hidden after this date.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter className="pt-4"><Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Slide</Button></DialogFooter>
            </form>
        </Form>
    );
};

const BannerForm = ({ banner, onSave, title }: { banner: CategoryBanner, onSave: (data: CategoryBanner) => void, title: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof bannerSchema>>({
        resolver: zodResolver(bannerSchema),
        defaultValues: banner,
    });
    
    useEffect(() => {
        form.reset(banner);
    }, [banner, form]);

    const onSubmit = (values: z.infer<typeof bannerSchema>) => {
        setIsLoading(true);
        setTimeout(() => {
            onSave(values);
            setIsLoading(false);
        }, 500);
    };

    return (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Banner
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const HubBannerForm = ({ banner, onSave }: { banner: HubBanner, onSave: (data: HubBanner) => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof bannerSchema>>({
        resolver: zodResolver(bannerSchema),
        defaultValues: banner,
    });

    useEffect(() => {
        form.reset(banner);
    }, [banner, form]);

    const onSubmit = (values: z.infer<typeof bannerSchema>) => {
        setIsLoading(true);
        setTimeout(() => {
            onSave(values);
            setIsLoading(false);
        }, 500);
    };

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Hub Banner
                    </Button>
                </div>
            </form>
        </Form>
    );
};

const FeaturedProductForm = ({ index, product, onSave }: { index: number, product: FeaturedProduct, onSave: (index: number, data: FeaturedProduct) => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof featuredProductSchema>>({
        resolver: zodResolver(featuredProductSchema),
        defaultValues: product,
    });

    useEffect(() => {
        form.reset(product);
    }, [product, form]);

    const onSubmit = (values: z.infer<typeof featuredProductSchema>) => {
        setIsLoading(true);
        setTimeout(() => {
            onSave(index, values);
            setIsLoading(false);
        }, 500);
    };

    return (
        <Card className="bg-muted/30">
            <CardHeader><CardTitle>Featured Product {index + 1}</CardTitle></CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="model" render={({ field }) => (
                            <FormItem><FormLabel>Model/Identifier</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Product
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const FooterContentForm = ({ storedValue, onSave }: { storedValue: FooterContent, onSave: (data: FooterContent) => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof footerContentSchema>>({
        resolver: zodResolver(footerContentSchema),
        defaultValues: storedValue,
    });
    
    useEffect(() => {
        form.reset(storedValue);
    }, [storedValue, form]);

    const onSubmit = (values: z.infer<typeof footerContentSchema>) => {
        setIsLoading(true);
        setTimeout(() => {
            onSave(values);
            setIsLoading(false);
        }, 500);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Footer Description</FormLabel><FormControl><Textarea placeholder="A short description about your app..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Support Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <h4 className="font-medium pt-2">Social Media Links</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="facebook" render={({ field }) => (
                        <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="twitter" render={({ field }) => (
                        <FormItem><FormLabel>Twitter/X URL</FormLabel><FormControl><Input placeholder="https://x.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="linkedin" render={({ field }) => (
                        <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="instagram" render={({ field }) => (
                        <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Footer Content
                    </Button>
                </div>
            </form>
        </Form>
    );
};

const ShippingSettingsForm = ({ storedValue, onSave }: { storedValue: ShippingSettings, onSave: (data: ShippingSettings) => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof shippingSettingsSchema>>({
        resolver: zodResolver(shippingSettingsSchema),
        defaultValues: storedValue,
    });
    
    useEffect(() => {
        form.reset(storedValue);
    }, [storedValue, form]);

    const onSubmit = (values: z.infer<typeof shippingSettingsSchema>) => {
        setIsLoading(true);
        setTimeout(() => {
            onSave(values);
            setIsLoading(false);
        }, 500);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="deliveryCharge" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Flat-Rate Delivery Charge (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Shipping Settings
                    </Button>
                </div>
            </form>
        </Form>
    );
};

const mockBankAccounts = [
    { id: 1, bankName: "HDFC Bank", accountNumber: "Ending in 3456" },
];


export default function AdminSettingsPage() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { toast } = useToast()
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false)
  const [isSendingWarning, setIsSendingWarning] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  const [contentList, setContentList] = useState(initialFlaggedContent);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Women");

  // useLocalStorage will be initialized with default values, and then updated in useEffect
  const [coupons, setCoupons] = useLocalStorage<Coupon[]>(COUPONS_KEY, []);
  const [slides, setSlides] = useLocalStorage<Slide[]>(PROMOTIONAL_SLIDES_KEY, []);
  const [categoryBanners, setCategoryBanners] = useLocalStorage<CategoryBanners>(CATEGORY_BANNERS_KEY, {} as CategoryBanners);
  const [footerContent, setFooterContent] = useLocalStorage<FooterContent>(FOOTER_CONTENT_KEY, defaultFooterContent);
  const [hubBanner, setHubBanner] = useLocalStorage<HubBanner>(HUB_BANNER_KEY, defaultHubBanner);
  const [featuredProducts, setFeaturedProducts] = useLocalStorage<FeaturedProduct[]>(HUB_FEATURED_PRODUCTS_KEY, []);
  const [shippingSettings, setShippingSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultShippingSettings);
  const [categories, setCategories] = useLocalStorage<Category[]>(CATEGORIES_KEY, defaultCategories);
  
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
  const [isSlideFormOpen, setIsSlideFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState(mockBankAccounts);

  const allCategories = useMemo(() => ['All', ...categories.map(c => c.name)], [categories]);
  const adminCoupons = useMemo(() => coupons.filter(c => c.sellerId === 'admin'), [coupons]);
  const sellerCoupons = useMemo(() => coupons.filter(c => c.sellerId !== 'admin'), [coupons]);


  // Initialize local storage with default data if it's empty
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        const existingCoupons = localStorage.getItem(COUPONS_KEY);
        if (!existingCoupons || JSON.parse(existingCoupons).length === 0) {
            setCoupons(initialCoupons);
        }
        
        const existingSlides = localStorage.getItem(PROMOTIONAL_SLIDES_KEY);
        if (!existingSlides || JSON.parse(existingSlides).length === 0) {
            setSlides(initialSlides);
        }
        
        const existingBanners = localStorage.getItem(CATEGORY_BANNERS_KEY);
        if (!existingBanners || Object.keys(JSON.parse(existingBanners)).length === 0) {
            setCategoryBanners(defaultCategoryBanners);
        }

         const existingFeaturedProducts = localStorage.getItem(HUB_FEATURED_PRODUCTS_KEY);
        if (!existingFeaturedProducts || JSON.parse(existingFeaturedProducts).length === 0) {
            setFeaturedProducts(defaultFeaturedProducts);
        }
    }
  }, [setCoupons, setSlides, setCategoryBanners, setFeaturedProducts]);
  
  const handleWithdraw = (amount: number, bankAccountId: string) => {
     const selectedAccount = bankAccounts.find(acc => String(acc.id) === bankAccountId);
     // Simulate API call to process withdrawal
     toast({
        title: "Withdrawal Initiated!",
        description: `₹${amount} is on its way to ${selectedAccount?.bankName}.`,
    });
     setIsWithdrawOpen(false);
  };
  
   const handleAddBankAccount = (data: any) => {
    const newAccount = {
        id: Date.now(),
        bankName: data.bankName,
        accountNumber: `Ending in ${data.accountNumber.slice(-4)}`
    };
    setBankAccounts(prev => [...prev, newAccount]);
    toast({
        title: "Bank Account Added",
        description: `${data.bankName} has been successfully linked.`
    });
  };

  const handleSaveCoupon = (coupon: Coupon) => {
    setCoupons(prev => {
        const newCoupons = [...prev];
        const existingIndex = newCoupons.findIndex(c => c.id === coupon.id);
        if (existingIndex > -1) {
            newCoupons[existingIndex] = coupon;
        } else {
            newCoupons.unshift({ ...coupon, id: Date.now(), sellerId: 'admin', status: 'active' });
        }
        return newCoupons;
    });
    toast({ title: "Coupon Saved!", description: `Coupon ${coupon.code} has been updated.` });
  };
  
  const handleCouponStatusChange = (couponId: number, status: Coupon['status']) => {
    setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, status } : c));
    toast({ title: "Coupon Status Updated" });
  };

  const handleDeleteCoupon = (couponId: number) => {
      setCoupons(coupons.filter(s => s.id !== couponId));
      toast({ title: "Coupon Deleted!", variant: "destructive" });
  };

  const openCouponForm = (coupon?: Coupon) => {
      setEditingCoupon(coupon);
      setIsCouponFormOpen(true);
  };
  
  const handleSaveSlide = (slide: Slide) => {
    const newSlides = [...slides];
    const existingIndex = newSlides.findIndex(s => s.id === slide.id);
    if (existingIndex > -1) newSlides[existingIndex] = slide;
    else newSlides.unshift({ ...slide, id: Date.now() });
    setSlides(newSlides);
    toast({ title: "Promotional Slide Saved!" });
  };

  const handleDeleteSlide = (slideId: number) => {
      setSlides(slides.filter(s => s.id !== slideId));
      toast({ title: "Slide Deleted!", variant: "destructive" });
  };

  const openSlideForm = (slide?: Slide) => {
      setEditingSlide(slide);
      setIsSlideFormOpen(true);
  };
  
   const handleSaveCategoryBanner = (bannerNumber: 'banner1' | 'banner2', data: CategoryBanner) => {
    setCategoryBanners(prev => ({
        ...prev,
        [selectedCategory]: {
            ...(prev[selectedCategory] || {}),
            [bannerNumber]: data,
        }
    }));
    toast({ title: "Banner Saved!", description: `Banner for ${selectedCategory} has been updated.` });
  };

   const handleSaveHubBanner = (data: HubBanner) => {
    setHubBanner(data);
    toast({ title: "Hub Banner Saved!", description: "The banner on the Listed Products page has been updated." });
  };

  const handleSaveFeaturedProduct = (index: number, data: FeaturedProduct) => {
      const newProducts = [...featuredProducts];
      newProducts[index] = data;
      setFeaturedProducts(newProducts);
      toast({ title: "Featured Product Saved!", description: `Product ${index + 1} has been updated.` });
  };

   const handleSaveFooter = (data: FooterContent) => {
        setFooterContent(data);
        toast({ title: "Footer Content Saved!", description: "Your footer has been updated successfully." });
    };
    
    const handleSaveShipping = (data: ShippingSettings) => {
        setShippingSettings(data);
        toast({ title: "Shipping Settings Saved!", description: `Delivery charge has been set to ₹${data.deliveryCharge.toFixed(2)}.` });
    };
    
    const handleSaveCategory = (data: Category) => {
        setCategories(prev => {
            const existingIndex = prev.findIndex(c => c.id === data.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = data;
                return updated;
            } else {
                return [data, ...prev];
            }
        });
        toast({ title: "Category Saved!", description: `Category "${data.name}" has been updated.` });
    };
    
    const handleDeleteCategory = (categoryId: string) => {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        toast({ title: "Category Deleted", variant: "destructive" });
    };

  const announcementForm = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: "", message: "" }
  })

  const warningForm = useForm<z.infer<typeof warningSchema>>({
    resolver: zodResolver(warningSchema),
    defaultValues: { userId: "", message: "" }
  })
  
  const onSendAnnouncement = async (values: z.infer<typeof announcementSchema>) => {
    setIsSendingAnnouncement(true)
    // Mock functionality since flow is removed
    setTimeout(() => {
        toast({ title: "Announcement Sent!", description: "This is a mock confirmation." })
        announcementForm.reset()
        setIsSendingAnnouncement(false)
    }, 1000);
  }

  const onSendWarning = async (values: z.infer<typeof warningSchema>) => {
    setIsSendingWarning(true)
     // Mock functionality since flow is removed
    setTimeout(() => {
        toast({ title: "Warning Sent!", description: `Warning sent to ${values.userId}.` })
        warningForm.reset()
        setIsSendingWarning(false)
    }, 1000);
  }

  const handleReviewContent = (item: typeof contentList[0]) => {
    let path = '';
    switch (item.type) {
      case 'User Profile': path = `/admin/users/${item.targetId}`; break;
      case 'Product Image': path = `/product/${item.targetId}`; break;
      case 'Chat Message': path = `/admin/messages?userId=${item.targetId}`; break;
      case 'Live Stream': path = `/stream/${item.targetId}`; break;
      default: toast({ title: "Cannot Review", description: "The content type does not have a review page.", variant: "destructive" }); return;
    }
    router.push(path);
  };


  const handleRemoveContent = (id: number) => {
    setContentList(prev => prev.filter(item => item.id !== id));
    toast({ title: "Content Action Taken", description: "The flagged content has been removed.", variant: "destructive" });
  }


  if (!isMounted || loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  const isAdmin = userData?.role === 'admin';
  const isSeller = userData?.role === 'seller';

  if (!isAdmin && !isSeller) {
      router.replace('/live-selling');
      return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }
  
  const currentBanners = categoryBanners[selectedCategory] || defaultCategoryBanners[selectedCategory as keyof typeof defaultCategoryBanners];

  return (
    <>
        <Dialog open={isCouponFormOpen} onOpenChange={setIsCouponFormOpen}>
             <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>{editingCoupon ? 'Edit' : 'Add New'} Coupon</DialogTitle><DialogDescription>Fill in the details for the discount coupon.</DialogDescription></DialogHeader>
                <CouponForm onSave={handleSaveCoupon} existingCoupon={editingCoupon} closeDialog={() => setIsCouponFormOpen(false)} allCategories={allCategories} />
            </DialogContent>
        </Dialog>
        <Dialog open={isSlideFormOpen} onOpenChange={setIsSlideFormOpen}>
             <DialogContent>
                <DialogHeader><DialogTitle>{editingSlide ? 'Edit' : 'Add New'} Slide</DialogTitle><DialogDescription>Fill in the details for the promotional slide.</DialogDescription></DialogHeader>
                <SlideForm onSave={handleSaveSlide} existingSlide={editingSlide} closeDialog={() => setIsSlideFormOpen(false)} />
            </DialogContent>
        </Dialog>
         <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
            <CategoryForm category={editingCategory} onSave={handleSaveCategory} onCancel={() => setIsCategoryFormOpen(false)} />
        </Dialog>
         <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>Withdraw Funds</DialogTitle>
                     <DialogDescription>Select a bank account to withdraw your available balance.</DialogDescription>
                 </DialogHeader>
                 <WithdrawForm 
                    cashAvailable={15231.00} // Mock data for now
                    bankAccounts={bankAccounts}
                    onWithdraw={handleWithdraw}
                    onAddAccount={handleAddBankAccount}
                />
            </DialogContent>
        </Dialog>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Link href={isAdmin ? "/admin/dashboard" : "/seller/dashboard"} className="flex items-center gap-2 text-lg font-semibold md:text-base"><ShieldCheck className="h-6 w-6" /><span className="sr-only">Admin</span></Link>
                     {isAdmin ? (
                        <>
                            <Link href="/admin/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                            <Link href="/admin/orders" className="text-muted-foreground transition-colors hover:text-foreground">Orders</Link>
                            <Link href="/admin/users" className="text-muted-foreground transition-colors hover:text-foreground">Users</Link>
                            <Link href="/admin/inquiries" className="text-muted-foreground transition-colors hover:text-foreground">Inquiries</Link>
                            <Link href="/admin/messages" className="text-muted-foreground transition-colors hover:text-foreground">Messages</Link>
                            <Link href="/admin/products" className="text-muted-foreground transition-colors hover:text-foreground">Products</Link>
                            <Link href="/admin/live-control" className="text-muted-foreground transition-colors hover:text-foreground">Live Control</Link>
                            <Link href="/admin/settings" className="text-foreground transition-colors hover:text-foreground">Settings</Link>
                        </>
                    ) : (
                         <>
                            <Link href="/seller/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                            <Link href="/seller/revenue" className="text-muted-foreground transition-colors hover:text-foreground">Revenue</Link>
                            <Link href="/seller/orders" className="text-muted-foreground transition-colors hover:text-foreground">Orders</Link>
                            <Link href="/seller/products" className="text-muted-foreground transition-colors hover:text-foreground">Products</Link>
                            <Link href="/seller/promotions" className="text-muted-foreground transition-colors hover:text-foreground">Promotions</Link>
                            <Link href="/seller/messages" className="text-muted-foreground transition-colors hover:text-foreground">Messages</Link>
                            <Link href="/seller/feed" className="text-muted-foreground hover:text-foreground">Feed</Link>
                            <Link href="/seller/settings" className="text-foreground transition-colors hover:text-foreground">Settings</Link>
                        </>
                    )}
                </nav>
                <Sheet>
                    <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
                    <SheetContent side="left">
                         <SheetHeader>
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        </SheetHeader>
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link href={isAdmin ? "/admin/dashboard" : "/seller/dashboard"} className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>{isAdmin ? 'Admin' : 'Seller'} Panel</span></Link>
                             {isAdmin ? (
                                <>
                                    <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                                    <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
                                    <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                                    <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">Inquiries</Link>
                                    <Link href="/admin/messages" className="text-muted-foreground hover:text-foreground">Messages</Link>
                                    <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">Products</Link>
                                    <Link href="/admin/live-control" className="text-muted-foreground hover:text-foreground">Live Control</Link>
                                    <Link href="/admin/settings" className="hover:text-foreground">Settings</Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/seller/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                                    <Link href="/seller/revenue" className="text-muted-foreground hover:text-foreground">Revenue</Link>
                                    <Link href="/seller/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
                                    <Link href="/seller/products" className="text-muted-foreground hover:text-foreground">Products</Link>
                                    <Link href="/seller/promotions" className="text-muted-foreground hover:text-foreground">Promotions</Link>
                                    <Link href="/seller/messages" className="text-muted-foreground hover:text-foreground">Messages</Link>
                                    <Link href="/seller/feed" className="text-muted-foreground hover:text-foreground">Feed</Link>
                                    <Link href="/seller/settings" className="hover:text-foreground">Settings</Link>
                                </>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto"></div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" className="rounded-full"><Avatar className="h-9 w-9"><AvatarImage src={user?.photoURL || 'https://placehold.co/40x40.png'} /><AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end"><DropdownMenuLabel>Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => router.push('/profile')}>Profile</DropdownMenuItem><DropdownMenuItem onSelect={() => router.push('/setting')}>Settings</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => signOut(isSeller)}>Logout</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 md:p-8">
                 {isSeller && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Wallet /> Payouts &amp; Bank Details</CardTitle>
                            <CardDescription>Manage your bank accounts for withdrawals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bank Name</TableHead>
                                        <TableHead>Account Number</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bankAccounts.map(account => (
                                        <TableRow key={account.id}>
                                            <TableCell className="font-medium">{account.bankName}</TableCell>
                                            <TableCell>{account.accountNumber}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                     {bankAccounts.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24">No bank accounts added.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                         <CardFooter className="border-t pt-6 flex-wrap gap-2 justify-between">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Bank Account</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Bank Account</DialogTitle>
                                        <DialogDescription>Link your bank account to receive payouts.</DialogDescription>
                                    </DialogHeader>
                                    <AddBankForm onSave={handleAddBankAccount} />
                                </DialogContent>
                            </Dialog>
                             <Button size="sm" variant="secondary" onClick={() => setIsWithdrawOpen(true)}>
                                Withdraw Funds
                            </Button>
                        </CardFooter>
                    </Card>
                 )}

                 {isAdmin && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Category Management</span>
                                    <Button size="sm" onClick={() => { setEditingCategory(null); setIsCategoryFormOpen(true); }}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                                    </Button>
                                </CardTitle>
                                <CardDescription>Add, edit, or delete product categories and subcategories.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category Name</TableHead>
                                            <TableHead>Subcategories</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map(category => (
                                            <TableRow key={category.id}>
                                                <TableCell className="font-semibold">{category.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {category.subcategories?.map(sub => <Badge key={sub.name} variant="outline">{sub.name}</Badge>)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(category); setIsCategoryFormOpen(true); }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                     <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Live Shopping Page Promotions</CardTitle><CardDescription>Manage the promotional slides on the main live shopping page.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {slides.length > 0 ? slides.map(slide => (
                                    <div key={slide.id} className={cn("flex items-center justify-between rounded-lg border p-4", slide.expiresAt && new Date(slide.expiresAt) < new Date() && "bg-muted/50")}>
                                        <div className="flex items-center gap-4"><Image src={slide.imageUrl} alt={slide.title} width={80} height={40} className="rounded-md object-cover" />
                                            <div><h4 className="font-semibold">{slide.title}</h4><p className="text-xs text-muted-foreground">{slide.description}</p>
                                                {slide.expiresAt ? (<p className={cn("text-xs mt-1", new Date(slide.expiresAt) < new Date() ? 'text-destructive font-semibold' : 'text-muted-foreground')}>Expires on: {format(new Date(slide.expiresAt), 'PPP')}{new Date(slide.expiresAt) < new Date() && <Badge variant="destructive" className="ml-2">Expired</Badge>}</p>) : null}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => openSlideForm(slide)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSlide(slide.id!)}><Trash2 className="h-4 w-4" /></Button></div>
                                    </div>
                                )) : (
                                    isMounted ? <p className="text-center text-muted-foreground py-4">No promotional slides have been created yet.</p> : <Skeleton className="w-full h-24" />
                                )}
                            </CardContent>
                             <CardFooter>
                                <Button size="sm" onClick={() => openSlideForm()}><PlusCircle className="mr-2 h-4 w-4" />Add New Slide</Button>
                            </CardFooter>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Category Hub Banner</CardTitle>
                                <CardDescription>Manage the main banner on the "Listed Products" page.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HubBannerForm banner={hubBanner} onSave={handleSaveHubBanner} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Hub Featured Products</CardTitle>
                                <CardDescription>Manage the three featured products shown below the hub banner.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredProducts.map((product, index) => (
                                   <FeaturedProductForm 
                                        key={index} 
                                        index={index}
                                        product={product} 
                                        onSave={handleSaveFeaturedProduct}
                                   />
                                ))}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Category Page Banner Management</CardTitle>
                                <CardDescription>Select a category to manage its two promotional banners.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-full md:w-1/2">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.name} value={cat.name}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {currentBanners ? (
                                     <div className="grid md:grid-cols-2 gap-6">
                                        <BannerForm
                                            key={`${selectedCategory}-1`}
                                            banner={currentBanners.banner1} 
                                            onSave={(data) => handleSaveCategoryBanner('banner1', data)} 
                                            title="Top Banner" 
                                        />
                                        <BannerForm 
                                            key={`${selectedCategory}-2`}
                                            banner={currentBanners.banner2} 
                                            onSave={(data) => handleSaveCategoryBanner('banner2', data)} 
                                            title="Bottom Banner" 
                                        />
                                    </div>
                                ) : (
                                     <p className="text-center text-muted-foreground py-4">Select a category to manage its banners.</p>
                                )}
                               
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div><CardTitle>Admin-Created Coupons</CardTitle><CardDescription>Create and manage global discount coupons.</CardDescription></div>
                                <Button size="sm" onClick={() => openCouponForm()}><PlusCircle className="mr-2 h-4 w-4" />Add New Coupon</Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {adminCoupons.length > 0 ? adminCoupons.map(coupon => (
                                     <div key={coupon.id} className={cn("flex items-center justify-between rounded-lg border p-4", coupon.expiresAt && new Date(coupon.expiresAt) < new Date() && "bg-muted/50")}>
                                        <div className="flex items-center gap-4"><div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center"><Ticket className="h-6 w-6 text-primary" /></div>
                                            <div>
                                                <h4 className="font-semibold">{coupon.code}</h4>
                                                <p className="text-xs text-muted-foreground">{coupon.description}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                                                    {coupon.minOrderValue && coupon.minOrderValue > 0 ? <Badge variant="outline">Min: ₹{coupon.minOrderValue}</Badge> : null}
                                                    {coupon.maxDiscount && coupon.maxDiscount > 0 ? <Badge variant="outline">Max: ₹{coupon.maxDiscount}</Badge> : null}
                                                    {coupon.applicableCategories && coupon.applicableCategories.length > 0 && coupon.applicableCategories[0] !== 'All' ? <Badge variant="outline" className="flex items-center gap-1"><GanttChart className="h-3 w-3" /> {coupon.applicableCategories.join(', ')}</Badge> : null}
                                                </div>
                                                {coupon.expiresAt ? (<p className={cn("text-xs mt-1", new Date(coupon.expiresAt) < new Date() ? 'text-destructive font-semibold' : 'text-muted-foreground')}>Expires on: {format(new Date(coupon.expiresAt), 'PPP')}{new Date(coupon.expiresAt) < new Date() && <Badge variant="destructive" className="ml-2">Expired</Badge>}</p>) : null}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => openCouponForm(coupon)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCoupon(coupon.id!)}><Trash2 className="h-4 w-4" /></Button></div>
                                    </div>
                                )) : (
                                    isMounted ? <p className="text-center text-muted-foreground py-4">No admin-created coupons yet.</p> : <Skeleton className="w-full h-24" />
                                )}
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Seller Promotions</CardTitle>
                                <CardDescription>Review, approve, or reject coupons submitted by sellers.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Seller</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sellerCoupons.map(coupon => (
                                            <TableRow key={coupon.id}>
                                                <TableCell>{coupon.sellerName || 'N/A'}</TableCell>
                                                <TableCell><Badge variant="secondary">{coupon.code}</Badge></TableCell>
                                                <TableCell>{coupon.description}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        coupon.status === 'active' ? 'success' :
                                                        coupon.status === 'pending' ? 'warning' : 'destructive'
                                                    }>
                                                        {coupon.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {coupon.status === 'pending' && (
                                                        <div className="flex gap-2 justify-end">
                                                            <Button size="sm" variant="success" onClick={() => handleCouponStatusChange(coupon.id!, 'active')}>
                                                                <Check className="mr-2 h-4 w-4" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleCouponStatusChange(coupon.id!, 'rejected')}>
                                                                <X className="mr-2 h-4 w-4" /> Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                     {coupon.status === 'active' && (
                                                        <Button size="sm" variant="destructive" onClick={() => handleCouponStatusChange(coupon.id!, 'archived')}>
                                                            <Archive className="mr-2 h-4 w-4" /> Archive
                                                        </Button>
                                                     )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {sellerCoupons.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">No seller promotions to review.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>


                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Truck /> Shipping &amp; Delivery</CardTitle>
                                <CardDescription>Manage shipping costs and other delivery settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ShippingSettingsForm storedValue={shippingSettings} onSave={handleSaveShipping} />
                            </CardContent>
                        </Card>
                        
                         <Card>
                            <CardHeader>
                                <CardTitle>User Notifications</CardTitle>
                                <CardDescription>Send notifications to all users or a specific user. This feature is currently disabled.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="announcement">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="announcement" disabled>Announcement</TabsTrigger>
                                        <TabsTrigger value="warning" disabled>Warning</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="announcement" className="pt-4">
                                        <Form {...announcementForm}>
                                            <form onSubmit={announcementForm.handleSubmit(onSendAnnouncement)} className="space-y-4">
                                            <FormField control={announcementForm.control} name="title" render={({ field }) => (
                                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., New Feature Added!" {...field} disabled/></FormControl><FormMessage /></FormItem>
                                            )}/>
                                                <FormField control={announcementForm.control} name="message" render={({ field }) => (
                                                <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Describe the announcement..." {...field} disabled/></FormControl><FormMessage /></FormItem>
                                            )}/>
                                                <Button type="submit" disabled><Send className="mr-2 h-4 w-4" /> Send to All Users</Button>
                                            </form>
                                        </Form>
                                    </TabsContent>
                                    <TabsContent value="warning" className="pt-4">
                                         <Form {...warningForm}>
                                            <form onSubmit={warningForm.handleSubmit(onSendWarning)} className="space-y-4">
                                                <FormField control={warningForm.control} name="userId" render={({ field }) => (
                                                    <FormItem><FormLabel>User ID or Email</FormLabel><FormControl><Input placeholder="Enter the user's unique ID or email address" {...field} disabled/></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={warningForm.control} name="message" render={({ field }) => (
                                                    <FormItem><FormLabel>Warning Message</FormLabel><FormControl><Textarea placeholder="Clearly state the reason for the warning..." {...field} disabled/></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <Button type="submit" variant="destructive" disabled><Annoyed className="mr-2 h-4 w-4" /> Send Warning</Button>
                                            </form>
                                        </Form>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Content &amp; Policy Management</CardTitle><CardDescription>View and manage important site-wide documents.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4"><div className="flex items-center gap-3"><FileText className="h-6 w-6 text-muted-foreground" /><div><h4 className="font-semibold">Terms &amp; Conditions</h4><p className="text-xs text-muted-foreground">Last updated: 26 Aug, 2025</p></div></div><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm"><Link href="/terms-and-conditions">View</Link></Button><Button asChild size="sm"><Link href="/admin/edit/terms">Edit</Link></Button></div></div>
                                <div className="flex items-center justify-between rounded-lg border p-4"><div className="flex items-center gap-3"><Shield className="h-6 w-6 text-muted-foreground" /><div><h4 className="font-semibold">Privacy Policy</h4><p className="text-xs text-muted-foreground">Last updated: 26 Aug, 2025</p></div></div><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm"><Link href="/privacy-and-security">View</Link></Button><Button asChild size="sm"><Link href="/admin/edit/privacy">Edit</Link></Button></div></div>
                                
                                 <Tabs defaultValue="footer-content" className="pt-4">
                                    <TabsList className="grid w-full grid-cols-1">
                                        <TabsTrigger value="footer-content">Footer Content</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="footer-content" className="pt-4 border-t">
                                       <FooterContentForm storedValue={footerContent} onSave={handleSaveFooter} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                        
                         <Card>
                            <CardHeader><CardTitle>Flagged Content for Review</CardTitle><CardDescription>Review content reported by users or the system for violations.</CardDescription></CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Content/Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {contentList.map((item) => (
                                            <TableRow key={item.id}><TableCell><Badge variant="outline">{item.type}</Badge></TableCell><TableCell><p className="font-medium">{item.content}</p><p className="text-xs text-muted-foreground">Reported by: {item.reporter}</p></TableCell><TableCell><Badge variant={item.status === 'Pending' ? 'destructive' : 'secondary'}>{item.status}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" className="mr-2" onClick={() => handleReviewContent(item)}>Review</Button><Button variant="destructive" size="sm" onClick={() => handleRemoveContent(item.id)}>Remove</Button></TableCell></TableRow>
                                        ))}
                                        {contentList.length === 0 && (
                                            <TableRow><TableCell colSpan={4} className="h-24 text-center"><Flag className="mx-auto h-8 w-8 text-muted-foreground mb-2" />No flagged content to review.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                 )}
            </main>
        </div>
    </>
  )
}

    