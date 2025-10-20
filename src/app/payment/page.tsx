
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreditCard, ShieldCheck, Banknote, Lock, Info, Loader2, ArrowRight, Wallet, QrCode, ArrowLeft, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { getCart, CartProduct, saveCart } from '@/lib/product-history';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SHIPPING_SETTINGS_KEY, ShippingSettings, Coupon, COUPONS_KEY } from '@/app/admin/settings/page';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { productDetails } from '@/lib/product-data';

const defaultShippingSettings: ShippingSettings = {
    deliveryCharge: 50.00
};

type PaymentMethod = 'upi' | 'cod' | 'debit' | 'credit' | 'wallet' | 'coins';

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userData, loading } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [invalidCard, setInvalidCard] = useState(false);
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [shippingSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultShippingSettings);
  
  const paymentMethods = [
    { id: 'wallet', label: 'Wallet', icon: <Wallet/> },
    { id: 'coins', label: 'Coins', icon: <Coins/>, disabled: true },
    { id: 'upi', label: 'UPI', icon: <QrCode/> },
    { id: 'cod', label: 'Cash on Delivery', icon: <Banknote/>, disabled: true },
    { id: 'debit', label: 'Debit Card', icon: <CreditCard/> },
    { id: 'credit', label: 'Credit Card', icon: <CreditCard/> }
  ];

  useEffect(() => {
    setIsClient(true);
    const items = getCart();
    if (items.length === 0) {
        // If cart is empty (e.g., page refresh on buy now), redirect
        router.replace('/live-selling');
        return;
    }
    setCartItems(items);
    const couponStr = localStorage.getItem('appliedCoupon');
    if (couponStr) {
      try {
        setAppliedCoupon(JSON.parse(couponStr));
      } catch (e) {
        console.error("Failed to parse applied coupon:", e);
      }
    }
  }, [router]);

  const { subtotal, shippingCost, estimatedTaxes, total, couponDiscount } = useMemo(() => {
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
                const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
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
            } else { // fixed amount
                discount = appliedCoupon.discountValue;
            }
        }
    }

    const tot = sub - discount + ship + tax;
    
    return {
        subtotal: sub,
        shippingCost: ship,
        estimatedTaxes: tax,
        total: tot,
        couponDiscount: discount
    };
  }, [cartItems, shippingSettings, appliedCoupon]);


  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'upi') {
        const upiId = (e.target as HTMLFormElement)['upi-id'].value;
        if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
            toast({
                variant: "destructive",
                title: "Invalid UPI ID",
                description: "Please enter a valid UPI ID to proceed.",
            });
            return;
        }
    }
    
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
  
  const renderPaymentContent = () => {
    switch (paymentMethod) {
        case 'wallet':
             return (
                 <form className="space-y-4" onSubmit={handlePlaceOrder}>
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Available Balance</span>
                            <span className="font-bold">₹42,580.22</span>
                        </div>
                         <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">Order Total</span>
                            <span className="font-bold text-primary">- ₹{total.toLocaleString('en-IN')}</span>
                        </div>
                        <Separator className="my-3"/>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Remaining Balance</span>
                            <span className="font-bold">₹{(42580.22 - total).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                     <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Pay from Wallet
                    </Button>
                 </form>
            );
        case 'upi':
            return (
                <form className="space-y-4" onSubmit={handlePlaceOrder}>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <p>UPI Payment</p>
                        <div className="flex items-center gap-1.5">
                            <Lock className="h-3 w-3" />
                            <span>256-bit encrypted</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <Input id="upi-id" placeholder="name@bank" />
                        <p className="text-xs text-muted-foreground">We'll send a collect request to this UPI ID.</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <p><ShieldCheck className="inline-block h-4 w-4 mr-2 text-green-500"/>Verified by NPCI</p>
                    </div>
                    {isProcessing && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2 animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            Waiting for approval in your UPI app
                        </div>
                    )}
                    <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                         {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Pay Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>
            );
        case 'cod':
             return (
                <div className="text-center text-muted-foreground p-8">
                    <p>Cash on Delivery is currently unavailable.</p>
                </div>
            );
        case 'debit':
        case 'credit':
            return (
                <form className="space-y-4" onSubmit={handlePlaceOrder}>
                    <div className="space-y-1">
                        <Label htmlFor="card-number">Card Number</Label>
                        <div className="relative">
                            <Input id="card-number" placeholder="1234 5678 9012 3456" />
                        </div>
                        {invalidCard && (
                            <div className="bg-pink-100 dark:bg-pink-900/30 text-red-600 dark:text-red-400 p-2 rounded-md text-xs mt-1">
                                Invalid card number. Please check and try again.
                            </div>
                        )}
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
                    {paymentMethod === 'credit' && <p className="text-xs text-muted-foreground">We do not store your card details.</p>}
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground flex items-center gap-2"><Lock className="h-3 w-3"/> Secured by 3D Secure</p>
                        <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">
                             {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Pay Now
                        </Button>
                    </div>
                </form>
            );
        default:
            return null;
    }
  }


  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
       <header className="p-4 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-30">
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold hidden sm:inline">Checkout</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Secure Payment</span>
            </div>
        </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                             <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r">
                                {paymentMethods.map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                                        disabled={method.disabled}
                                        className={cn("w-full p-4 text-left font-semibold flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                            paymentMethod === method.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'hover:bg-muted/50'
                                        )}
                                    >
                                        {method.icon}
                                        {method.label}
                                    </button>
                                ))}
                            </div>
                            <div className="w-full md:w-2/3 p-6">
                               {renderPaymentContent()}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:sticky top-24 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-4 max-h-60 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.size || ''}-${item.color || ''}`} className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-md border flex-shrink-0">
                                            <Image src={item.imageUrl} alt={item.name} layout="fill" className="object-cover rounded-md" data-ai-hint={item.hint}/>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {item.color && <span>Color: {item.color}</span>}
                                                {item.size && <span>Size: {item.size}</span>}
                                            </div>
                                        </div>
                                        <p className="font-semibold text-sm">₹{(parseFloat(item.price.replace(/[^0-9.-]+/g, '')) * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {couponDiscount > 0 && (
                                     <div className="flex justify-between text-green-600">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span>- ₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>₹{shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>₹{estimatedTaxes.toFixed(2)}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
