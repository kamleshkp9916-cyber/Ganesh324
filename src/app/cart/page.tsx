
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Home, Edit, Tag, Ticket, Star, Users, X, Loader2, Flag, MessageSquare, HelpCircle, FileText, Info } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getCart, removeFromCart, updateCartQuantity, CartProduct, saveCart } from '@/lib/product-history';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { format, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditAddressForm } from '@/components/edit-address-form';
import { productDetails } from '@/lib/product-data';
import { UserData, updateUserData } from '@/lib/follow-data';
import { SHIPPING_SETTINGS_KEY, ShippingSettings } from '@/components/settings/shipping-settings';
import { Coupon, COUPONS_KEY, AdditionalCharge, ADDITIONAL_CHARGES_KEY } from '@/components/settings/keys';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { cn } from '@/lib/utils';
import { HelpChat } from '@/components/help-chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


function EmptyCart() {
    const router = useRouter();
    return (
        <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4 flex-grow justify-center">
            <ShoppingCart className="w-16 h-16 text-border" />
            <h3 className="text-xl font-semibold">Your Cart is Empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Button onClick={() => router.push('/live-selling')}>Start Shopping</Button>
        </div>
    );
}

const defaultShippingSettings: ShippingSettings = {
    deliveryCharge: 50.00
};

const defaultAdditionalCharges: AdditionalCharge[] = [];

export default function CartPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [address, setAddress] = useState(userData?.addresses?.[0] || null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false);
  
  const [shippingSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultShippingSettings);
  const [storedCoupons] = useLocalStorage<Coupon[]>(COUPONS_KEY, []);
  const [additionalCharges] = useLocalStorage<AdditionalCharge[]>(ADDITIONAL_CHARGES_KEY, defaultAdditionalCharges);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && storedCoupons) {
      try {
          const parsedCoupons = storedCoupons.map((c: any) => ({...c, expiresAt: c.expiresAt ? new Date(c.expiresAt) : undefined }));
          const now = new Date();
          const activeCoupons = parsedCoupons.filter((c: any) => !c.expiresAt || c.expiresAt >= now);
          setAvailableCoupons(activeCoupons);
      } catch(e) {
          console.error("Failed to parse coupons from local storage", e);
      }
    }
  }, [isClient, storedCoupons]);


  useEffect(() => {
    if (loading || !isClient) return;

    if (!user) {
        router.replace("/");
        return;
    }

    if (userData?.addresses && userData.addresses.length > 0) {
        setAddress(userData.addresses[0]);
    }
    
    setEstimatedDeliveryDate(format(addDays(new Date(), 5), 'E, MMM dd, yyyy'));

    // The cart should always be loaded from local storage now
    setCartItems(getCart());
    
  }, [user, userData, loading, isClient, router]);


  const handleRemoveFromCart = (productId: number, size?: string, color?: string) => {
    removeFromCart(productId, size, color);
    setCartItems(getCart());
    toast({
      title: "Item Removed",
      description: "The item has been removed from your cart.",
    });
  };

  const handleQuantityChange = (productId: number, newQuantity: number, size?: string, color?: string) => {
      updateCartQuantity(productId, newQuantity, size, color);
      setCartItems(getCart());
  };

  const handleAddressSave = (newAddress: any) => {
    setAddress(newAddress);
    setIsAddressDialogOpen(false);
    toast({
        title: "Address Selected!",
        description: "Your delivery address has been set."
    })
  };
  
  const handleAddressesUpdate = (newAddresses: any[]) => {
    if(user){
      updateUserData(user.uid, { addresses: newAddresses });
    }
  }


  const subtotal = useMemo(() => {
      return cartItems.reduce((acc, item) => {
          const price = parseFloat(item.price.replace('₹', '').replace(/,/g, ''));
          return acc + (price * item.quantity);
      }, 0);
  }, [cartItems]);
  
  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;

    const couponSubtotal = cartItems.reduce((acc, item) => {
        const itemCategory = productDetails[item.key as keyof typeof productDetails]?.category;
        if (appliedCoupon.applicableCategories?.includes('All') || (itemCategory && appliedCoupon.applicableCategories?.includes(itemCategory))) {
             const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
             return acc + (price * item.quantity);
        }
        return acc;
    }, 0);

    if (appliedCoupon.minOrderValue && subtotal < appliedCoupon.minOrderValue) {
        return 0;
    }

    let discount = 0;
    if (appliedCoupon.discountType === 'percentage') {
        discount = couponSubtotal * (appliedCoupon.discountValue / 100);
        if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
            discount = appliedCoupon.maxDiscount;
        }
    } else { // fixed amount
        discount = appliedCoupon.discountValue;
    }
    return discount;
}, [appliedCoupon, cartItems, subtotal]);

    const applicableCharges = useMemo(() => {
        return additionalCharges.filter(charge => charge.displayLocation.includes('Cart Summary'));
    }, [additionalCharges]);

    const totalAdditionalCharges = useMemo(() => {
        return applicableCharges.reduce((acc, charge) => {
            if (charge.type === 'fixed') {
                return acc + charge.value;
            }
            if (charge.type === 'percentage') {
                return acc + (subtotal * (charge.value / 100));
            }
            return acc;
        }, 0);
    }, [applicableCharges, subtotal]);

  const shippingCost = shippingSettings?.deliveryCharge ?? 50.00;
  const estimatedTaxes = subtotal * 0.05;
  const total = subtotal - couponDiscount + shippingCost + estimatedTaxes + totalAdditionalCharges;

  const handleApplyCoupon = (code: string) => {
    const couponToApply = availableCoupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    if (!couponToApply) {
        toast({
            variant: "destructive",
            title: "Invalid Coupon",
            description: "The discount code you entered is not valid."
        });
        return;
    }
    if (couponToApply.minOrderValue && subtotal < couponToApply.minOrderValue) {
        toast({
            variant: "destructive",
            title: "Cannot Apply Coupon",
            description: `Your order total must be above ₹${couponToApply.minOrderValue} to use this coupon.`
        });
        return;
    }
    setAppliedCoupon(couponToApply);
    setCouponCode(code);
    toast({
        title: "Coupon Applied!",
        description: `You've got a discount with ${couponToApply.code}.`
    });
  };

  const handleCheckout = () => {
    if (!address) {
        toast({
            variant: "destructive",
            title: "No Delivery Address",
            description: "Please add or select a delivery address to continue.",
        });
        return;
    }

    setIsCheckingOut(true);
    if(appliedCoupon) {
        localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
        localStorage.removeItem('appliedCoupon');
    }
    router.push('/payment');
  };


   if (loading || !isClient || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    );
  }

  const isBuyNow = cartItems.length === 1 && localStorage.getItem('buyNow') === 'true';

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">{isBuyNow ? 'Checkout' : 'Shopping Cart'}</h1>
        <div className="w-10"></div>
      </header>
       {cartItems.length === 0 ? (
         <div className="flex-grow flex items-center justify-center">
             <EmptyCart />
         </div>
      ) : (
      <div className="flex-grow lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start max-w-6xl mx-auto w-full lg:p-8">
        <main className="lg:col-span-2">
            
                <Card className="rounded-none lg:rounded-lg">
                    <CardHeader>
                        <CardTitle>{isBuyNow ? 'Your Item' : `Your Items (${totalItems})`}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-full max-h-[calc(100vh-250px)] lg:max-h-none">
                        <div className="divide-y">
                            {cartItems.map(item => {
                                const details = productDetails[item.key as keyof typeof productDetails];
                                const hasDiscount = details && details.discountPercentage && details.discountPercentage > 0;
                                const discountedPrice = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
                                const originalPrice = hasDiscount ? discountedPrice / (1 - details.discountPercentage / 100) : discountedPrice;
                                
                                return (
                                     <div key={`${item.id}-${item.size || ''}-${item.color || ''}`} className="p-4 flex flex-col sm:flex-row sm:justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <Link href={`/product/${item.key}`} className="block">
                                                    <Image src={item.imageUrl || 'https://placehold.co/100x100.png'} alt={item.name} width={100} height={100} className="rounded-lg object-cover" data-ai-hint={item.hint} />
                                                </Link>
                                            </div>
                                            <div className="flex-grow flex flex-col justify-between min-w-0">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <Link href={`/product/${item.key}`} className="hover:underline flex-grow min-w-0">
                                                            <h3 className="font-semibold truncate">{item.name}</h3>
                                                        </Link>
                                                        {!isBuyNow && (
                                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0" onClick={() => handleRemoveFromCart(item.id, item.size, item.color)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {(item.size || item.color) && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {item.size && <Badge variant="outline">Size: {item.size}</Badge>}
                                                            {item.color && <Badge variant="outline">Color: {item.color}</Badge>}
                                                        </div>
                                                    )}
                                                     <div className="flex items-baseline gap-x-2 mt-1">
                                                        <p className="font-bold text-sm text-foreground">
                                                            ₹{discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                        {hasDiscount && (
                                                            <>
                                                                <p className="text-xs text-muted-foreground line-through">
                                                                    ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </p>
                                                                <Badge variant="destructive" className="text-[10px] px-1 py-0">({details.discountPercentage}% OFF)</Badge>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs mt-1">
                                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                                        <span className="font-semibold text-foreground">4.8</span>
                                                        <span className="text-muted-foreground">(1.2k reviews)</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Estimated delivery by <span className="font-semibold text-foreground">{estimatedDeliveryDate}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between sm:flex-col sm:items-end sm:justify-between sm:gap-4 sm:mt-0">
                                            <div className='flex items-center'>
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.size, item.color)} disabled={item.quantity <= 1}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.size, item.color)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="font-bold text-base sm:mt-auto">
                                                ₹{(discountedPrice * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                            )})}
                        </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            
        </main>

        
            <aside className="lg:col-span-1 lg:sticky lg:top-24">
                <div className="bg-background lg:bg-transparent rounded-t-lg -mx-4 sm:mx-0 px-4 sm:px-0 pt-4 pb-20 lg:p-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {applicableCharges.map(charge => (
                                <div key={charge.id} className="flex justify-between">
                                    <span className="text-muted-foreground">{charge.name}</span>
                                    <span>{charge.type === 'fixed' ? `₹${charge.value.toFixed(2)}` : `${charge.value}%`}</span>
                                </div>
                            ))}
                            {appliedCoupon && (
                                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                                    <span className="flex items-center gap-1.5"><Tag className="h-4 w-4"/> Coupon ({appliedCoupon.code})</span>
                                    <span>- ₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>₹{shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    Estimated taxes
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Info className="h-4 w-4 cursor-pointer" />
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <p className="text-sm">Taxes are calculated based on your shipping address and include GST (2.5%) and SGST (2.5%) on the subtotal.</p>
                                        </PopoverContent>
                                    </Popover>
                                </span>
                                <span>₹{estimatedTaxes.toFixed(2)}</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                            <div className="hidden lg:block pt-4">
                            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                                {isCheckingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Continue to Payment
                            </Button>
                            {!address && (
                                <p className="text-destructive text-xs text-center mt-2">
                                    Please add a delivery address to continue.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="mt-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                                Delivery To
                            </CardTitle>
                            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="link" size="sm" className="p-0 h-auto text-sm hover:text-primary"><Edit className="mr-2 h-3 w-3" /> {address ? 'Change' : 'Add Address'}</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Change Delivery Address</DialogTitle>
                                    </DialogHeader>
                                    <EditAddressForm 
                                        onSave={handleAddressSave} 
                                        onCancel={() => setIsAddressDialogOpen(false)}
                                        onAddressesUpdate={handleAddressesUpdate}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                        <CardDescription>{address ? "Your order will be delivered here." : "Please select or add a delivery address."}</CardDescription>
                    </CardHeader>
                    {address && (
                        <CardContent className="text-sm space-y-2">
                            <div className="flex items-start gap-3">
                                <Home className="h-5 w-5 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">{address.name}</p>
                                    <p className="text-muted-foreground">{address.village}, {address.city}, {address.state} - {address.pincode}</p>
                                    <p className="text-muted-foreground">Phone: {address.phone}</p>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>
                <div className="p-4 mt-auto flex items-center justify-center gap-x-2">
                    <Button variant="link" className="text-xs text-muted-foreground hover:text-primary px-2" onClick={() => toast({ title: "Report Sent", description: "Thank you for your feedback." })}>Report</Button>
                    <FeedbackDialog>
                        <Button variant="link" className="text-xs text-muted-foreground hover:text-primary px-2">Feedback</Button>
                    </FeedbackDialog>
                    <Button asChild variant="link" className="text-xs text-muted-foreground hover:text-primary px-2"><Link href="/contact">Contact Us</Link></Button>
                    <Button asChild variant="link" className="text-xs text-muted-foreground hover:text-primary px-2"><Link href="/help">Help</Link></Button>
                </div>
            </div>
            </aside>
        
      </div>
      )}

       {cartItems.length > 0 && (
           <div className="lg:hidden sticky bottom-0 left-0 right-0 bg-background border-t p-4 z-20 shadow-[-2px_0px_16px_rgba(0,0,0,0.2)]">
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                    {isCheckingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue to Payment (₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </Button>
                {!address && (
                    <p className="text-destructive text-xs text-center mt-2">
                        Please add a delivery address to continue.
                    </p>
                )}
           </div>
       )}
      
      {isHelpChatOpen && (
        <HelpChat
            order={null}
            onClose={() => setIsHelpChatOpen(false)}
            initialOptions={[
                "Problem with my cart",
                "Question about a product",
                "Delivery inquiry",
                "Talk to a support executive"
            ]}
        />
      )}
    </div>
  );
}
