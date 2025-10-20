
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, ShieldCheck, Banknote, Lock, Info, Loader2, ArrowRight, Wallet, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { getCart, CartProduct } from '@/lib/product-history';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SHIPPING_SETTINGS_KEY, ShippingSettings, Coupon, COUPONS_KEY } from '@/app/admin/settings/page';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { productDetails } from '@/lib/product-data';

const defaultShippingSettings: ShippingSettings = {
    deliveryCharge: 50.00
};

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [invalidCard, setInvalidCard] = useState(false);
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [availableOffers, setAvailableOffers] = useState<Coupon[]>([]);

  const [shippingSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultShippingSettings);
  const [storedCoupons] = useLocalStorage<Coupon[]>(COUPONS_KEY, []);
  
  useEffect(() => {
    setIsClient(true);
    const cart = getCart();
    setCartItems(cart);
    const coupon = localStorage.getItem('appliedCoupon');
    if (coupon) {
      setAppliedCoupon(JSON.parse(coupon));
    }
  }, []);

  const { subtotal, couponDiscount, shippingCost, estimatedTaxes, total } = useMemo(() => {
    const sub = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g,""));
        return acc + (price * item.quantity);
    }, 0);

    const ship = shippingSettings?.deliveryCharge ?? 50.00;
    const tax = sub * 0.05; // 5% mock tax
    
    let discount = 0;
    if (appliedCoupon) {
        const couponSubtotal = cartItems.reduce((acc, item) => {
            const itemCategory = productDetails[item.key as keyof typeof productDetails]?.category;
            if (appliedCoupon.applicableCategories?.includes('All') || (itemCategory && appliedCoupon.applicableCategories?.includes(itemCategory))) {
                 const price = parseFloat(item.price.replace('₹', '').replace(/,/g, ''));
                 return acc + (price * item.quantity);
            }
            return acc;
        }, 0);

        if (!appliedCoupon.minOrderValue || sub >= appliedCoupon.minOrderValue) {
            if (appliedCoupon.discountType === 'percentage') {
                discount = couponSubtotal * (appliedCoupon.discountValue / 100);
                if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
                    discount = appliedCoupon.maxDiscount;
                }
            } else {
                discount = appliedCoupon.discountValue;
            }
        }
    }

    const tot = sub - discount + ship + tax;
    
    return {
        subtotal: sub,
        couponDiscount: discount,
        shippingCost: ship,
        estimatedTaxes: tax,
        total: tot
    };
  }, [cartItems, shippingSettings, appliedCoupon]);

  useEffect(() => {
      if (cartItems.length > 0) {
          const applicable = storedCoupons.filter(coupon => {
              if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
                  return false;
              }
              const cartCategories = new Set(cartItems.map(item => productDetails[item.key as keyof typeof productDetails]?.category));
              if (coupon.applicableCategories?.includes('All')) {
                  return true;
              }
              return coupon.applicableCategories?.some(cat => cartCategories.has(cat));
          });
          setAvailableOffers(applicable);
      }
  }, [cartItems, storedCoupons, subtotal]);


  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        toast({
            title: "Order Placed!",
            description: "Your order has been successfully placed. Thank you for shopping with StreamCart!",
        });
        localStorage.removeItem('streamcart_cart');
        localStorage.removeItem('appliedCoupon');
        router.push('/orders');
    }, 3000);
  }

  if (!isClient || loading) {
      return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>
  }

  if (!user) {
      router.push('/');
      return null;
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
       <header className="p-4 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-30 border-b">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-bold">Checkout</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure Payment</span>
            </div>
        </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Accordion type="single" collapsible defaultValue="credit-card" className="w-full space-y-4">
                            <AccordionItem value="credit-card" className="border rounded-lg">
                                <AccordionTrigger className="p-4 font-semibold">
                                     <div className="flex items-center gap-3">
                                        <CreditCard className="h-6 w-6" />
                                        <span>Credit / Debit Card</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border-t">
                                     <form className="space-y-4" onSubmit={handlePlaceOrder}>
                                         <div className="space-y-1">
                                            <Label htmlFor="card-number">Card Number</Label>
                                            <div className="relative">
                                                <Input id="card-number" placeholder="1234 5678 9012 3456" />
                                                <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <p className="text-xs text-muted-foreground">We do not store your card details.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label htmlFor="expiry">Expiry</Label>
                                                <Input id="expiry" placeholder="MM / YY" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="cvv">CVV</Label>
                                                <Input id="cvv" type="password" placeholder="•••" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="name">Name on Card</Label>
                                            <Input id="name" placeholder="Full name" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-muted-foreground flex items-center gap-2"><Lock className="h-3 w-3"/> PCI DSS compliant</p>
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Pay Now</Button>
                                        </div>
                                    </form>
                                </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="upi" className="border rounded-lg">
                                <AccordionTrigger className="p-4 font-semibold">
                                    <div className="flex items-center gap-3">
                                        <Image src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" width={24} height={24} />
                                        <span>UPI Payment</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border-t">
                                    <form className="space-y-4" onSubmit={handlePlaceOrder}>
                                        <div className="space-y-1">
                                            <Label htmlFor="upi-id">UPI ID</Label>
                                            <Input id="upi-id" placeholder="name@bank" />
                                            <p className="text-xs text-muted-foreground">We'll send a collect request to this UPI ID.</p>
                                        </div>
                                         <div className="text-xs text-muted-foreground flex items-center gap-2">
                                            <Lock className="h-3 w-3"/> 256-bit encrypted
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                                                <Loader2 className="h-4 w-4 animate-spin"/>
                                                Waiting for approval in your UPI app
                                            </div>
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                                Pay Now <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </form>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="cod" className="border rounded-lg opacity-50 cursor-not-allowed">
                                <AccordionTrigger className="p-4 font-semibold" disabled>
                                    <div className="flex items-center gap-3">
                                        <Banknote className="h-6 w-6" />
                                        <span>Cash on Delivery (Currently Unavailable)</span>
                                    </div>
                                </AccordionTrigger>
                            </AccordionItem>

                        </Accordion>
                        
                         <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Status</CardTitle>
                                <CardDescription>This area will display confirmation or error messages after the transaction.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isProcessing ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                        <p>Processing your payment...</p>
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground">
                                        <p>Waiting for payment...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>

             <div className="lg:sticky top-24 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cartItems.map((item) => (
                             <div key={`${item.id}-${item.size || ''}-${item.color || ''}`} className="flex items-center gap-4">
                                <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-md border" />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    <p className="font-bold">{item.price}</p>
                                </div>
                            </div>
                        ))}
                        <Separator />
                         <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                             {couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                                    <span className="flex items-center gap-1.5"><Tag className="h-4 w-4"/> Coupon Discount</span>
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
                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                            <ShieldCheck className="h-4 w-4"/>
                            <span>Secure Checkout</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center px-4">By completing your purchase you agree to our Terms and Privacy Policy.</p>
                         <Separator />
                          <div className="space-y-2">
                             <Label>Available Offers</Label>
                             <div className="space-y-2">
                                {availableOffers.map(offer => (
                                    <button key={offer.id} onClick={() => router.push('/cart')} className="w-full text-left p-2 border rounded-lg hover:bg-muted/50">
                                        <p className="font-bold text-primary flex items-center gap-1"><Ticket className="h-4 w-4" /> {offer.code}</p>
                                        <p className="text-xs text-muted-foreground">{offer.description}</p>
                                    </button>
                                ))}
                                {availableOffers.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No offers available for your cart.</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
