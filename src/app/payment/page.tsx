
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { CreditCard, ShieldCheck, Banknote, Lock, Info, Loader2, ArrowRight, Wallet, QrCode, ArrowLeft, Coins, Ticket, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const defaultShippingSettings: ShippingSettings = {
    deliveryCharge: 50.00
};

const initialCoupons: Coupon[] = [
    { id: 1, code: 'STREAM10', description: '10% off on all orders', discountType: 'percentage', discountValue: 10, expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)), applicableCategories: ['All'], minOrderValue: 0 },
    { id: 2, code: 'SAVE100', description: '₹100 off on orders above ₹1000', discountType: 'fixed', discountValue: 100, minOrderValue: 1000, applicableCategories: ['All'] },
];

type PaymentMethod = 'upi' | 'cod' | 'debit' | 'credit' | 'wallet' | 'coins';

const paymentMethods = [
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" />, disabled: false },
    { id: 'coins', label: 'Coins', icon: <Coins className="w-5 h-5" />, disabled: true },
    { id: 'upi', label: 'UPI', icon: <QrCode className="w-5 h-5" />, disabled: false },
    { id: 'cod', label: 'Cash on Delivery', icon: <Banknote className="w-5 h-5" />, disabled: true },
    { id: 'debit', label: 'Debit Card', icon: <CreditCard className="w-5 h-5" />, disabled: false },
    { id: 'credit', label: 'Credit Card', icon: <CreditCard className="w-5 h-5" />, disabled: false },
];

const SuccessModal = ({ isOpen, onClose, productImage, productName }: { isOpen: boolean, onClose: () => void, productImage: string, productName: string }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0" onPointerDownOutside={(e) => e.preventDefault()}>
                 <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative aspect-[4/5] hidden md:block">
                         <Image 
                            src={productImage} 
                            alt={productName}
                            fill
                            className="object-cover rounded-l-lg"
                            data-ai-hint="snowboarder"
                         />
                    </div>
                    <div className="p-8 sm:p-12 flex flex-col justify-center items-center text-center">
                        <h2 className="text-3xl font-bold mb-2">Congratulations</h2>
                        <p className="text-xl font-semibold mb-4">Your purchase was a success!</p>
                        <p className="text-muted-foreground mb-8">
                            Thank you for entrusting your care to us. Please be patient as we process your items as quickly as possible.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/live-selling" onClick={onClose}>Back to Homepage</Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, userData, loading } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [invalidCard, setInvalidCard] = useState(false);
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [savedUpiIds, setSavedUpiIds] = useState(['ganeshprajapati@okhdfcbank']);
  const [newUpiId, setNewUpiId] = useState('');
  const [saveUpi, setSaveUpi] = useState(false);
  const [selectedUpi, setSelectedUpi] = useState(savedUpiIds[0] || '');


  const [shippingSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultShippingSettings);
  const [allOffers, setAllOffers] = useLocalStorage<Coupon[]>(COUPONS_KEY, []);
  
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
        const storedCoupons = localStorage.getItem(COUPONS_KEY);
        if (!storedCoupons || JSON.parse(storedCoupons).length === 0) {
            setAllOffers(initialCoupons);
        }
    }
  }, [setAllOffers]);
  
  useEffect(() => {
    if (!isClient) return;

    const items = getCart();
    
    if (items.length === 0 && isClient) {
        toast({
            title: "Your cart is empty!",
            description: "Redirecting you to the shopping page.",
            duration: 3000
        });
        router.replace('/live-selling');
        return;
    }

    setCartItems(items);
    
    const couponStr = localStorage.getItem('appliedCoupon');
    if (couponStr) {
      try {
        const parsedCoupon = JSON.parse(couponStr);
        setAppliedCoupon(parsedCoupon);
        setCouponCode(parsedCoupon.code);
      } catch (e) {
        console.error("Failed to parse applied coupon:", e);
      }
    }
    
    // Clear the buy now flag
    localStorage.removeItem('buyNow');

  }, [isClient, searchParams, router, toast]);


  const { subtotal, shippingCost, estimatedTaxes, total, couponDiscount } = useMemo(() => {
    const sub = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g,""));
        return acc + (item.quantity * price);
    }, 0);

    const ship = shippingSettings?.deliveryCharge ?? 50.00;
    const tax = sub * 0.05; // 5% mock tax

    let discount = 0;
    const productHasOffer = cartItems.some(item => {
        const productDetail = productDetails[item.key as keyof typeof productDetails];
        return productDetail && productDetail.discountPercentage && productDetail.discountPercentage > 0;
    });

    if (appliedCoupon && !productHasOffer) {
        const couponSubtotal = cartItems.reduce((acc, item) => {
            const itemCategory = productDetails[item.key as keyof typeof productDetails]?.category;
            const applicableOffer = allOffers.find(offer =>
              (offer.applicableCategories?.includes('All') || (itemCategory && offer.applicableCategories?.includes(itemCategory))) &&
              (!offer.minOrderValue || sub >= offer.minOrderValue) &&
              (!offer.expiresAt || new Date(offer.expiresAt) > new Date())
            );
            // If an active offer is already better or applied, don't apply coupon discount to this item
            if(applicableOffer && applicableOffer.code !== appliedCoupon.code) {
                 return acc;
            }
            if (appliedCoupon.applicableCategories?.includes('All') || (itemCategory && appliedCoupon.applicableCategories?.includes(itemCategory))) {
                const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
                return acc + (price * item.quantity);
            }
            return acc;
        }, 0);

        if (!appliedCoupon.minOrderValue || sub >= couponSubtotal) {
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
  }, [cartItems, shippingSettings, appliedCoupon, allOffers]);

    const availableOffers = useMemo(() => {
        if (!allOffers || allOffers.length === 0) return [];
        const now = new Date();

        const applicable = allOffers.filter(offer => {
             if (typeof offer.expiresAt === 'string') {
                offer.expiresAt = new Date(offer.expiresAt);
             }
             const isExpired = offer.expiresAt && offer.expiresAt < now;
             if (isExpired) return false;

             if (offer.minOrderValue && subtotal < offer.minOrderValue) return false;

             return cartItems.some(item => {
                 const itemCategory = productDetails[item.key as keyof typeof productDetails]?.category;
                 return offer.applicableCategories?.includes('All') || (itemCategory && offer.applicableCategories?.includes(itemCategory));
             });
        });

        if (applicable.length > 0) {
            return applicable;
        }

        return allOffers.filter(offer => {
            if (typeof offer.expiresAt === 'string') {
                offer.expiresAt = new Date(offer.expiresAt);
            }
            return (!offer.expiresAt || offer.expiresAt >= now);
        }).slice(0, 3);
    }, [allOffers, cartItems, subtotal]);


  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    let paymentSuccess = true;
    let upiIdToProcess = '';
    
    if (paymentMethod === 'upi') {
        upiIdToProcess = newUpiId || selectedUpi;
        if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiIdToProcess)) {
            toast({
                variant: "destructive",
                title: "Invalid UPI ID",
                description: "Please select a saved UPI ID or enter a valid new one.",
            });
            return;
        }
    }
    
    if(paymentMethod === 'credit' || paymentMethod === 'debit') {
        const cardNumberInput = (e.target as HTMLFormElement).querySelector('#card-number') as HTMLInputElement;
        // Simple mock validation for demo
        if (cardNumberInput && cardNumberInput.value.length < 16) {
            paymentSuccess = false;
        }
    }

    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        if (paymentSuccess) {
            if (paymentMethod === 'upi' && saveUpi && newUpiId) {
                setSavedUpiIds(prev => [...prev, newUpiId]);
                setSaveUpi(false);
                setNewUpiId('');
                toast({ title: "UPI ID Saved!" });
            }
            localStorage.removeItem('streamcart_cart');
            localStorage.removeItem('appliedCoupon');
            setIsSuccessModalOpen(true);
        } else {
             toast({
                variant: "destructive",
                title: "❌ Transaction Failed",
                description: "Your payment could not be processed. Please try another method.",
            });
        }
    }, 3000);
  }
  
  const handleApplyCoupon = (code: string) => {
    const couponToApply = availableOffers.find(c => c.code.toLowerCase() === code.toLowerCase());
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

  if (!isClient || loading || cartItems.length === 0) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>
  }

  if(!user) {
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
                     <Button type="submit" size="lg" className="w-full">
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
                    {savedUpiIds.length > 0 && (
                        <RadioGroup value={selectedUpi} onValueChange={setSelectedUpi} className="space-y-2">
                            {savedUpiIds.map(id => (
                                <Label key={id} htmlFor={id} className="flex items-center gap-3 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/10 cursor-pointer">
                                    <RadioGroupItem value={id} id={id} />
                                    {id}
                                </Label>
                            ))}
                        </RadioGroup>
                    )}
                    <div className="space-y-1">
                        <Label htmlFor="upi-id">Or Enter New UPI ID</Label>
                        <Input id="upi-id" placeholder="name@bank" value={newUpiId} onChange={e => { setNewUpiId(e.target.value); setSelectedUpi(''); }} />
                        {newUpiId && (
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox id="save-upi" checked={saveUpi} onCheckedChange={(checked) => setSaveUpi(Boolean(checked))} />
                                <label htmlFor="save-upi" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Save this UPI ID for future use
                                </label>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">We'll send a collect request to this UPI ID.</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <p><ShieldCheck className="inline-block h-4 w-4 mr-2 text-green-500"/>Verified by NPCI</p>
                    </div>
                    {isProcessing && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2 animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            Waiting for approval in your UPI app...
                        </div>
                    )}
                    <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
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
                        <Button type="submit" size="lg" disabled={isProcessing}>
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
    <>
    <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => router.push('/live-selling')}
        productImage={cartItems[0]?.imageUrl || 'https://placehold.co/600x800.png'}
        productName={cartItems[0]?.name || 'Your Product'}
    />
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
       <header className="p-4 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-30 border-b">
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className='flex flex-col sm:flex-row sm:items-center sm:gap-2'>
                    <h1 className="text-xl font-bold hidden sm:inline">Checkout</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">(Step 2 of 3 — Payment)</p>
                </div>
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
                                         className={cn("w-full p-4 text-left font-semibold flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-b last:border-b-0 md:border-b-0",
                                             paymentMethod === method.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Order Summary</CardTitle>
                            <Button asChild variant="link" size="sm" className="p-0 h-auto text-sm hover:text-primary">
                                <Link href="/cart">
                                    <Edit className="mr-1 h-3 w-3" /> Edit
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.size || ''}-${item.color || ''}`} className="flex items-start gap-4">
                                        <div className="relative w-16 h-16 rounded-md border flex-shrink-0">
                                            <Image src={item.imageUrl} alt={item.name} layout="fill" className="object-cover rounded-md" data-ai-hint={item.hint}/>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm leading-tight">{item.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {item.color && <span>Color: {item.color}</span>}
                                                {item.size && <span>Size: {item.size}</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-sm">₹{(parseFloat(item.price.replace(/[^0-9.-]+/g, '')) * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-4" />
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
                            <Separator className="my-4" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </CardContent>
                         <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
                            <div className="space-y-2 w-full">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                    <span>Secure Checkout</span>
                                </div>
                                <p className="text-xs text-muted-foreground">By completing your purchase you agree to our <Link href="/terms-and-conditions" className="underline hover:text-primary">Terms</Link> and <Link href="/privacy-and-security" className="underline hover:text-primary">Privacy Policy</Link>.</p>
                            </div>
                            <div className="w-full space-y-2 pt-2">
                                <Label htmlFor="promo-code">Promo Code</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="promo-code" 
                                        placeholder="Enter code" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!appliedCoupon}
                                    />
                                    {appliedCoupon ? (
                                         <Button variant="outline" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>Remove</Button>
                                    ) : (
                                         <Button variant="outline" onClick={() => handleApplyCoupon(couponCode)}>Apply</Button>
                                    )}
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
      </main>
    </div>
    </>
  );
}

    