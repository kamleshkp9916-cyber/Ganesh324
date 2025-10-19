"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag, Info, Search, Heart, User, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { getCart, CartProduct } from '@/lib/product-history';
import Link from 'next/link';
import { COUPONS_KEY, SHIPPING_SETTINGS_KEY, ShippingSettings } from '@/app/admin/settings/page';
import { useLocalStorage } from '@/hooks/use-local-storage';


const defaultShippingSettings: ShippingSettings = {
    deliveryCharge: 50.00
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponCode, setCouponCode] = useState("");
  
  const [shippingSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultShippingSettings);
  const [storedCoupons] = useLocalStorage<any[]>(COUPONS_KEY, []);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
      if (!loading && !user) {
        router.replace('/');
        return;
      }
      setCartItems(getCart());
    }
  }, [isClient, user, loading, router]);
  
  const subtotal = useMemo(() => {
      return cartItems.reduce((acc, item) => {
          const price = parseFloat(item.price.replace('₹', '').replace(/,/g, ''));
          return acc + (price * item.quantity);
      }, 0);
  }, [cartItems]);
  
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
        return subtotal * (appliedCoupon.discountValue / 100);
    }
    if (appliedCoupon.discountType === 'fixed') {
        if (appliedCoupon.code === 'SAVE100' && subtotal < 1000) return 0;
        return appliedCoupon.discountValue;
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const shippingCost = shippingSettings?.deliveryCharge ?? 50.00;
  const taxes = subtotal * 0.05; // 5% estimated tax
  const total = subtotal - couponDiscount + shippingCost + taxes;
  
  const handleApplyCoupon = () => {
    const coupon = storedCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase() && (!c.expiresAt || new Date(c.expiresAt) >= new Date()));
    
    if (coupon) {
        if (coupon.code === 'SAVE100' && subtotal < 1000) {
            toast({
                variant: "destructive",
                title: "Cannot Apply Coupon",
                description: "Your order total must be above ₹1000 to use this coupon."
            });
            return;
        }
        setAppliedCoupon(coupon);
        toast({
            title: "Coupon Applied!",
            description: `You've got a discount with ${coupon.code}.`
        });
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Coupon",
            description: "The coupon code is invalid or has expired."
        });
    }
  };


  if (!isClient || loading) {
      return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
        <div className="grid lg:grid-cols-2">
            <div className="py-8 px-4 md:px-12">
                 <Button variant="ghost" className="mb-4 -ml-4" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {/* Left column content will go here */}
                <div className="h-96 bg-card rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Payment details will go here.</p>
                </div>
            </div>
            <div className="bg-background border-l py-8 px-4 md:px-12 h-screen sticky top-0">
                 <div className="flex items-center justify-between mb-6">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search" className="pl-9" />
                    </div>
                    <div className="flex items-center gap-4">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        <Heart className="h-6 w-6 text-muted-foreground" />
                        <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                </div>
                 <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
                  <div className="space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                           <div className="relative flex-shrink-0">
                                <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover border" />
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{item.quantity}</Badge>
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.brand}</p>
                            </div>
                            <p className="font-semibold">₹{(parseFloat(item.price.replace('₹', '').replace(/,/g, '')) * item.quantity).toLocaleString()}</p>
                        </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center gap-2">
                      <div className="relative flex-grow">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input 
                              placeholder="Discount code" 
                              className="pl-9" 
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                           />
                      </div>
                      <Button variant="outline" onClick={handleApplyCoupon}>Apply</Button>
                  </div>
                  
                  <Separator className="my-6" />

                  <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>₹{shippingCost.toFixed(2)}</span>
                      </div>
                       <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-1">
                              Estimated taxes
                              <Info className="h-3 w-3" />
                          </span>
                          <span>₹{taxes.toFixed(2)}</span>
                      </div>
                  </div>
                  
                   <Separator className="my-6" />

                   <div className="flex justify-between font-bold text-lg">
                       <span>Total</span>
                       <span>₹{total.toFixed(2)}</span>
                   </div>

                    <Button size="lg" className="w-full mt-6">Continue to Payment</Button>
            </div>
        </div>
    </div>
  );
}
