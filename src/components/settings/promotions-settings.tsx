
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Edit, Ticket, Calendar as CalendarIcon, Upload, Loader2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { defaultCategories, Category } from "@/lib/categories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";

export const PROMOTIONAL_SLIDES_KEY = 'streamcart_promotional_slides';
export const COUPONS_KEY = 'streamcart_coupons';
export const CATEGORY_BANNERS_KEY = 'streamcart_category_banners';
export const CATEGORY_HUB_BANNER_KEY = 'streamcart_category_hub_banner';


export interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  expiresAt?: Date;
}

const defaultSlides: Slide[] = [
  { id: 1, imageUrl: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxmYXNoaW9uJTIwbW9kZWx8ZW58MHx8fHwxNzYxNTYyNzc5fDA&ixlib=rb-4.1.0&q=80&w=1080', title: "Discover products you'll love", description: "Curated picks, timeless design, and everyday prices. Start exploring our latest arrivals and best sellers." },
  { id: 2, imageUrl: 'https://images.unsplash.com/photo-1562572159-4efc207f5aff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwbW9kZWx8ZW58MHx8fHwxNzYxNTYyNzc5fDA&ixlib=rb-4.1.0&q=80&w=1080', title: 'New Arrivals Are Here', description: 'Check out the latest fashion trends and must-have styles for the new season.' },
  { id: 3, imageUrl: 'https://images.unsplash.com/photo-1627292441194-0280c19e74e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxmYXNoaW9uJTIwbW9kZWx8ZW58MHx8fHwxNzYxNTYyNzc5fDA&ixlib=rb-4.1.0&q=80&w=1080', title: "Women's Fashion", description: 'Explore our curated collection of women\'s clothing and accessories.' },
];

const slideSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  imageUrl: z.string().url("Please enter a valid URL."),
  expiresAt: z.date().optional(),
});

const SlideForm = ({ onSave, existingSlide, closeDialog }: { onSave: (slide: Slide) => void, existingSlide?: Slide, closeDialog: () => void }) => {
  const form = useForm<z.infer<typeof slideSchema>>({
    resolver: zodResolver(slideSchema),
    defaultValues: existingSlide || { title: "", description: "", imageUrl: "" },
  });

  const onSubmit = (values: z.infer<typeof slideSchema>) => {
    onSave({ ...values, id: existingSlide?.id || Date.now() });
    closeDialog();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Summer Sale" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., Up to 50% off!" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://images.unsplash.com/..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="expiresAt" render={({ field }) => (
            <FormItem className="flex flex-col"><FormLabel>Expiration Date (Optional)</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()-1)) } initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
        )}/>
        <DialogFooter className="pt-4"><Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button><Button type="submit">Save Slide</Button></DialogFooter>
      </form>
    </Form>
  );
};

const couponSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(3, "Code must be at least 3 characters.").regex(/^[A-Z0-9]+$/, "Code can only contain uppercase letters and numbers."),
  description: z.string().min(5, "Description is required."),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive("Discount must be a positive number."),
  maxDiscount: z.number().optional(),
  expiresAt: z.date().optional(),
  minOrderValue: z.number().optional(),
  applicableCategories: z.array(z.string()).default(['All']),
});

export type Coupon = z.infer<typeof couponSchema> & { status: 'active' | 'archived' };

export interface Banner {
  title: string;
  description: string;
  imageUrl: string;
}

export interface CategoryBanners {
  [categoryName: string]: {
    banner1: Banner;
    banner2: Banner;
  };
}

const initialCoupons: Coupon[] = [
    { id: 1, code: 'STREAM10', description: '10% off on all orders', discountType: 'percentage', discountValue: 10, expiresAt: new Date('2025-11-13'), applicableCategories: ['All'], status: 'active' },
    { id: 2, code: 'SAVE100', description: '₹100 off on orders above ₹1000', discountType: 'fixed', discountValue: 100, minOrderValue: 1000, applicableCategories: ['All'], status: 'active' },
];

const CouponForm = ({ onSave, existingCoupon, closeDialog }: { onSave: (coupon: Coupon) => void, existingCoupon?: Coupon, closeDialog: () => void }) => {
    const form = useForm<z.infer<typeof couponSchema>>({
        resolver: zodResolver(couponSchema),
        defaultValues: existingCoupon ? { 
            ...existingCoupon,
            expiresAt: existingCoupon.expiresAt ? new Date(existingCoupon.expiresAt) : undefined,
        } : {
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: 0,
            minOrderValue: 0,
            applicableCategories: ['All'],
        },
    });

    const onSubmit = (values: z.infer<typeof couponSchema>) => {
        onSave({ ...values, id: existingCoupon?.id || Date.now(), status: existingCoupon?.status || 'active' });
        closeDialog();
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input placeholder="e.g., SALE10" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Short Description</FormLabel><FormControl><Input placeholder="e.g., 10% off electronics" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
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
                <DialogFooter className="pt-4"><Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button><Button type="submit">Save Coupon</Button></DialogFooter>
            </form>
        </Form>
    );
}

const CategoryBannerManagement = () => {
    const [allCategories] = useLocalStorage<Category[]>(CATEGORIES_KEY, defaultCategories);
    const [allBanners, setAllBanners] = useLocalStorage<CategoryBanners>(CATEGORY_BANNERS_KEY, {});
    const [selectedCategory, setSelectedCategory] = useState<string>(allCategories[0]?.name || '');
    const [banner1Data, setBanner1Data] = useState<Banner>({ title: '', description: '', imageUrl: '' });
    const [banner2Data, setBanner2Data] = useState<Banner>({ title: '', description: '', imageUrl: '' });
    const { toast } = useToast();

    useEffect(() => {
        if (selectedCategory && allBanners[selectedCategory]) {
            setBanner1Data(allBanners[selectedCategory].banner1);
            setBanner2Data(allBanners[selectedCategory].banner2);
        } else {
            setBanner1Data({ title: '', description: '', imageUrl: '' });
            setBanner2Data({ title: '', description: '', imageUrl: '' });
        }
    }, [selectedCategory, allBanners]);

    const handleSaveBanner = (bannerNumber: 1 | 2) => {
        const dataToSave = bannerNumber === 1 ? banner1Data : banner2Data;
        setAllBanners(prev => ({
            ...prev,
            [selectedCategory]: {
                ...prev[selectedCategory],
                [`banner${bannerNumber}`]: dataToSave
            }
        }));
        toast({ title: "Banner Saved!", description: `Banner for ${selectedCategory} has been updated.` });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Page Banner Management</CardTitle>
                <CardDescription>Select a category to manage its two promotional banners.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-1/3">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {allCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Top Banner</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label>Title</Label>
                                <Input value={banner1Data.title} onChange={(e) => setBanner1Data(prev => ({ ...prev, title: e.target.value }))} />
                            </div>
                             <div className="space-y-1">
                                <Label>Description</Label>
                                <Textarea value={banner1Data.description} onChange={(e) => setBanner1Data(prev => ({ ...prev, description: e.target.value }))} />
                            </div>
                             <div className="space-y-1">
                                <Label>Image URL</Label>
                                <Input value={banner1Data.imageUrl} onChange={(e) => setBanner1Data(prev => ({ ...prev, imageUrl: e.target.value }))} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSaveBanner(1)}>Save Banner</Button>
                        </CardFooter>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Bottom Banner</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label>Title</Label>
                                <Input value={banner2Data.title} onChange={(e) => setBanner2Data(prev => ({ ...prev, title: e.target.value }))} />
                            </div>
                             <div className="space-y-1">
                                <Label>Description</Label>
                                <Textarea value={banner2Data.description} onChange={(e) => setBanner2Data(prev => ({ ...prev, description: e.target.value }))} />
                            </div>
                             <div className="space-y-1">
                                <Label>Image URL</Label>
                                <Input value={banner2Data.imageUrl} onChange={(e) => setBanner2Data(prev => ({ ...prev, imageUrl: e.target.value }))} />
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button onClick={() => handleSaveBanner(2)}>Save Banner</Button>
                        </CardFooter>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
};

export interface HubBanner {
  title: string;
  description: string;
  imageUrl: string;
}

const defaultHubBanner: HubBanner = {
    title: "Discover products you'll love",
    description: "Curated picks, timeless design, and everyday prices. Start exploring our latest arrivals and best sellers.",
    imageUrl: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxmYXNoaW9uJTIwbW9kZWx8ZW58MHx8fHwxNzYxNTYyNzc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
};

const CategoryHubBannerSettings = () => {
    const [banner, setBanner] = useLocalStorage<HubBanner>(CATEGORY_HUB_BANNER_KEY, defaultHubBanner);
    const [formState, setFormState] = useState<HubBanner>(defaultHubBanner);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setFormState(banner);
    }, [banner]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setBanner(formState);
            toast({ title: "Hub Banner Saved!", description: "The banner on the Listed Products page has been updated." });
            setIsSaving(false);
        }, 500);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Hub Banner</CardTitle>
                <CardDescription>Manage the main banner on the "Listed Products" page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="hub-title">Title</Label>
                    <Input id="hub-title" name="title" value={formState.title} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hub-description">Description</Label>
                    <Textarea id="hub-description" name="description" value={formState.description} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hub-imageUrl">Image URL</Label>
                    <Input id="hub-imageUrl" name="imageUrl" value={formState.imageUrl} onChange={handleChange} />
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Hub Banner
                </Button>
            </CardFooter>
        </Card>
    );
};

export function PromotionsSettings() {
  const [slides, setSlides] = useLocalStorage<Slide[]>(PROMOTIONAL_SLIDES_KEY, defaultSlides);
  const [coupons, setCoupons] = useLocalStorage<Coupon[]>(COUPONS_KEY, initialCoupons);
  
  const [isSlideFormOpen, setIsSlideFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | undefined>(undefined);
  
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
  
  const handleSaveSlide = (slide: Slide) => {
    setSlides(prev => {
        const newSlides = [...prev];
        const existingIndex = newSlides.findIndex(s => s.id === slide.id);
        if(existingIndex > -1) {
            newSlides[existingIndex] = slide;
        } else {
            newSlides.push(slide);
        }
        return newSlides;
    });
  };

  const handleDeleteSlide = (slideId: number) => {
    setSlides(prev => prev.filter(s => s.id !== slideId));
  };
  
  const openSlideForm = (slide?: Slide) => {
      setEditingSlide(slide);
      setIsSlideFormOpen(true);
  };
  
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
  };

  const handleDeleteCoupon = (couponId: number) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  const openCouponForm = (coupon?: Coupon) => {
      setEditingCoupon(coupon);
      setIsCouponFormOpen(true);
  };
  
  return (
    <Dialog open={isSlideFormOpen || isCouponFormOpen} onOpenChange={(open) => {
        if (isSlideFormOpen) setIsSlideFormOpen(open);
        if (isCouponFormOpen) setIsCouponFormOpen(open);
    }}>
        <Tabs defaultValue="slides" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="hub-banner">Hub Banner</TabsTrigger>
                <TabsTrigger value="slides">Promotional Slides</TabsTrigger>
                <TabsTrigger value="category-banners">Category Banners</TabsTrigger>
                <TabsTrigger value="coupons">Admin Coupons</TabsTrigger>
            </TabsList>
            <TabsContent value="hub-banner" className="mt-4">
                <CategoryHubBannerSettings />
            </TabsContent>
            <TabsContent value="slides" className="mt-4">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Promotional Slides</CardTitle>
                            <CardDescription>Manage the rotating banners on the homepage.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => openSlideForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add Slide</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {slides.map(slide => (
                                <div key={slide.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <img src={slide.imageUrl} alt={slide.title} className="w-24 h-16 object-cover rounded-md" />
                                        <div>
                                            <h4 className="font-semibold">{slide.title}</h4>
                                            <p className="text-sm text-muted-foreground">{slide.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openSlideForm(slide)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteSlide(slide.id!)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            {slides.length === 0 && <p className="text-center text-muted-foreground py-8">No promotional slides have been added yet.</p>}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="category-banners" className="mt-4">
                <CategoryBannerManagement />
            </TabsContent>
            <TabsContent value="coupons" className="mt-4">
                 <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Admin-Created Coupons</CardTitle>
                            <CardDescription>Create and manage global discount coupons.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => openCouponForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add New Coupon</Button>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {coupons.map(coupon => (
                            <div key={coupon.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border bg-muted/50 gap-4">
                                <div className="flex items-start sm:items-center gap-4">
                                     <div className="w-12 h-12 bg-background rounded-md flex items-center justify-center flex-shrink-0">
                                        <Ticket className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-semibold text-lg">{coupon.code}</h4>
                                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                                        <div className="flex items-center gap-2 flex-wrap mt-1">
                                            {coupon.minOrderValue && <Badge variant="outline">Min: ₹{coupon.minOrderValue}</Badge>}
                                            {coupon.expiresAt && <p className="text-xs text-muted-foreground">Expires on: {format(new Date(coupon.expiresAt), "MMM dd, yyyy")}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-center">
                                    <Button variant="ghost" size="icon" onClick={() => openCouponForm(coupon)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCoupon(coupon.id!)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))}
                         {coupons.length === 0 && <p className="text-center text-muted-foreground py-8">No admin coupons created yet.</p>}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        
        {isSlideFormOpen && <SlideForm onSave={handleSaveSlide} existingSlide={editingSlide} closeDialog={() => setIsSlideFormOpen(false)} />}
        {isCouponFormOpen && <CouponForm onSave={handleSaveCoupon} existingCoupon={editingCoupon} closeDialog={() => setIsCouponFormOpen(false)} />}
    </Dialog>
  );
}

    
```