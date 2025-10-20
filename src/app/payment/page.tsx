
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreditCard, ShieldCheck, Banknote, Lock, Info, Loader2, ArrowRight, Wallet, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
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

type PaymentMethod = 'upi' | 'cod' | 'debit' | 'credit';

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [invalidCard, setInvalidCard] = useState(false);
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [shippingSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultShippingSettings);
  
  useEffect(() => {
    setIsClient(true);
    const cart = getCart();
    // For demo purposes, if cart is empty, add a default item.
    if (cart.length === 0) {
      const defaultProductKey = 'prod_5';
      const defaultProduct = productDetails[defaultProductKey];
      if(defaultProduct) {
        const defaultCartItem: CartProduct = {
          ...defaultProduct,
          id: defaultProduct.id,
          key: defaultProduct.key,
          quantity: 1,
          imageUrl: defaultProduct.images[0],
          price: '₹3,499.00',
          color: 'Charcoal'
        };
        setCartItems([defaultCartItem]);
      }
    } else {
      setCartItems(cart);
    }

    const couponStr = localStorage.getItem('appliedCoupon');
    if (couponStr) {
      try {
        setAppliedCoupon(JSON.parse(couponStr));
      } catch (e) {
        console.error("Failed to parse applied coupon:", e);
      }
    }
  }, []);

  const { subtotal, shippingCost, estimatedTaxes, total } = useMemo(() => {
    const sub = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g,""));
        return acc + (price * item.quantity);
    }, 0);

    const ship = shippingSettings?.deliveryCharge ?? 99.00;
    const tax = sub * 0.05; // 5% mock tax

    const tot = sub + ship + tax;
    
    return {
        subtotal: sub,
        shippingCost: ship,
        estimatedTaxes: tax,
        total: tot
    };
  }, [cartItems, shippingSettings]);


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
  
  const renderPaymentContent = () => {
    switch (paymentMethod) {
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
                     <div className="text-sm text-muted-foreground flex items-center gap-2 animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        Waiting for approval in your UPI app
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                        Pay Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>
            );
        case 'cod':
             return (
                <form className="space-y-4" onSubmit={handlePlaceOrder}>
                    <div className="space-y-1">
                        <Label htmlFor="cod-phone">Contact Number</Label>
                        <Input id="cod-phone" defaultValue={userData?.phone || ''} placeholder="Your contact number for delivery" />
                    </div>
                    <div className="space-y-1">
                         <Label htmlFor="cod-address">Delivery Address</Label>
                        <p className="text-sm p-3 border rounded-md bg-muted/50">{userData?.addresses?.[0] ? `${userData.addresses[0].village}, ${userData.addresses[0].city}` : "No address saved"}</p>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Pay at your doorstep
                        </label>
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">Proceed to Payment</Button>
                </form>
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
                        <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">Pay Now</Button>
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
                <CreditCard className="h-6 w-6"/>
                <h1 className="text-xl font-bold">Checkout</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure Payment</span>
            </div>
        </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Complete Your Payment</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                             <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r">
                                {[{id: 'upi', label: 'UPI', icon: <QrCode/>}, {id: 'cod', label: 'Cash on Delivery', icon: <Banknote/>}, {id: 'debit', label: 'Debit Card', icon: <CreditCard/>}, {id: 'credit', label: 'Credit Card', icon: <CreditCard/>}].map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                                        disabled={method.id === 'cod'}
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
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Payment Status</CardTitle>
                            <CardDescription>This area will display confirmation or error messages after the transaction.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                <p>Processing your payment...</p>
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
                            {cartItems.map((item) => (
                                <div key={`${item.id}-${item.size || ''}-${item.color || ''}`} className="flex items-center gap-4">
                                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md border" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Color: {item.color || 'Default'} • Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-sm">{item.price}</p>
                                </div>
                            ))}
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
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
                            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                                <ShieldCheck className="h-4 w-4"/>
                                <span>Secure Checkout</span>
                            </div>
                            <p className="text-xs text-muted-foreground text-center px-4">By completing your purchase you agree to our Terms and Privacy Policy.</p>
                            <Separator />
                             <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Promo Code</span>
                                    <Button variant="link" size="sm" className="p-0 h-auto">ENTER CODE</Button>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span>Gift wrap</span>
                                    <span>+ ₹49</span>
                                </div>
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

    