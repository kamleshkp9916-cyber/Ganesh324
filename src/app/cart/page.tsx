
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Home, Edit, Tag, Ticket, Star, Users, X, Loader2 } from 'lucide-react';
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
import { COUPONS_KEY, SHIPPING_SETTINGS_KEY, ShippingSettings, Coupon } from '@/app/admin/settings/page';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  
  const [shippingSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultShippingSettings);
  const [storedCoupons] = useLocalStorage<Coupon[]>(COUPONS_KEY, []);

  const buyNowProductId = searchParams.get('productId');
  const buyNowSize = searchParams.get('size');
  const buyNowColor = searchParams.get('color');
  const isBuyNow = searchParams.get('buyNow') === 'true';

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
    if (!loading && isClient) {
      if (!user) {
        router.replace("/");
      } else {
        if (userData?.addresses && userData.addresses.length > 0) {
          setAddress(userData.addresses[0]);
        }
        
        setEstimatedDeliveryDate(format(addDays(new Date(), 5), 'E, MMM dd, yyyy'));

        if (isBuyNow && buyNowProductId) {
          const productData = productDetails[buyNowProductId as keyof typeof productDetails];
          if (productData) {
            const buyNowItem: CartProduct = {
              ...productData,
              quantity: 1,
              imageUrl: productData.images[0],
              size: buyNowSize || undefined,
              color: buyNowColor || undefined,
            };
            setCartItems([buyNowItem]);
          }
        } else {
          setCartItems(getCart());
        }
      }
    }
  }, [user, userData, isBuyNow, buyNowProductId, buyNowSize, buyNowColor, loading, isClient, router]);


  const handleRemoveFromCart = (productId: number, size?: string, color?: string) => {
    removeFromCart(productId, size, color);
    setCartItems(getCart());
    toast({
      title: "Item Removed",
      description: "The item has been removed from your cart.",
    });
  };

  const handleQuantityChange = (productId: number, newQuantity: number, size?: string, color?: string) => {
      if (isBuyNow) {
          setCartItems(currentItems => 
              currentItems.map(item => 
                  item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
              )
          );
      } else {
          updateCartQuantity(productId, newQuantity, size, color);
          setCartItems(getCart());
      }
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
             const price = parseFloat(item.price.replace('₹', '').replace(/,/g, ''));
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

  const shippingCost = shippingSettings?.deliveryCharge ?? 50.00;
  const estimatedTaxes = subtotal * 0.05;
  const total = subtotal - couponDiscount + shippingCost + estimatedTaxes;

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
    setIsCheckingOut(true);
    // Save the current cart state to local storage before navigating
    saveCart(cartItems);
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
    )
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">{isBuyNow ? 'Checkout' : 'Shopping Cart'}</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
            {cartItems.length === 0 ? (
                <EmptyCart />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{isBuyNow ? 'Your Item' : `Your Items (${totalItems})`}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {cartItems.map(item => (
                                        <div key={`${item.id}-${item.size || ''}-${item.color || ''}`} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <Link href={`/product/${item.key}`} className="block flex-shrink-0">
                                                <Image src={item.imageUrl || 'https://placehold.co/100x100.png'} alt={item.name} width={100} height={100} className="rounded-lg object-cover" data-ai-hint={item.hint} />
                                            </Link>
                                            <div className="flex-grow">
                                                <Link href={`/product/${item.key}`} className="hover:underline">
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                </Link>
                                                <p className="text-sm text-muted-foreground mt-1">{item.price}</p>
                                                {(item.size || item.color) && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {item.size && <Badge variant="outline">Size: {item.size}</Badge>}
                                                        {item.color && <Badge variant="outline">Color: {item.color}</Badge>}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                    <div className="flex items-center gap-1 text-amber-500">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        <span>4.8</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        <span>1,234 buyers</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">Estimated delivery by <span className="font-semibold text-foreground">{estimatedDeliveryDate}</span></p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.size, item.color)} disabled={item.quantity <= 1}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.size, item.color)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="font-bold w-24 text-right">
                                                ₹{(parseFloat(item.price.replace('₹', '').replace(/,/g, '')) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            {!isBuyNow && (
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => handleRemoveFromCart(item.id, item.size, item.color)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                     <div className="lg:sticky top-24 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="coupon-code">Discount Code</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="coupon-code"
                                            placeholder="Enter code" 
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            disabled={!!appliedCoupon}
                                        />
                                        <Button onClick={() => handleApplyCoupon(couponCode)} disabled={!couponCode || !!appliedCoupon}>Apply</Button>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
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
                                        <span className="text-muted-foreground">Estimated taxes</span>
                                        <span>₹{estimatedTaxes.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg" onClick={handleCheckout}>
                                    {isCheckingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Continue to Payment
                                </Button>
                            </CardFooter>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        Delivery To
                                    </CardTitle>
                                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm"><Edit className="mr-2 h-3 w-3" /> {address ? 'Change' : 'Add Address'}</Button>
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
                     </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
