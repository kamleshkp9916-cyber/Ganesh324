
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { CreditCard, ShieldCheck, Banknote, Lock, Info, Loader2, ArrowRight, Wallet, QrCode, ArrowLeft, Coins, Ticket, Edit, Home, MessageSquare, HelpCircle, FileText, Send, Flag, LifeBuoy, X } from 'lucide-react';
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
import { ShippingSettings, SHIPPING_SETTINGS_KEY } from '@/components/settings/shipping-settings';
import { Coupon, COUPONS_KEY, AdditionalCharge, ADDITIONAL_CHARGES_KEY } from '@/components/settings/keys';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { productDetails, productToSellerMapping } from '@/lib/product-data';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { EditAddressForm } from '@/components/edit-address-form';
import { HelpChat } from '@/components/help-chat';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Order, saveOrder } from '@/lib/order-data';
import { addTransaction } from '@/lib/transaction-history';
import { updateUserData } from '@/lib/follow-data';
import { format, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';


const defaultShippingSettings: ShippingSettings = {
    deliveryCharge: 50.00
};

const initialCoupons: Coupon[] = [
    { id: 1, code: 'STREAM10', description: '10% off on all orders', discountType: 'percentage', discountValue: 10, expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)), applicableCategories: ['All'], status: 'active' },
    { id: 2, code: 'SAVE100', description: '₹100 off on orders above ₹1000', discountType: 'fixed', discountValue: 100, minOrderValue: 1000, applicableCategories: ['All'], status: 'active' },
];

const defaultAdditionalCharges: AdditionalCharge[] = [];

type PaymentMethod = 'upi' | 'cod' | 'debit' | 'credit' | 'wallet' | 'coins';

const paymentMethods = [
    { id: 'upi', label: 'UPI', icon: <QrCode className="w-5 h-5" />, disabled: false },
    { id: 'cod', label: 'Cash on Delivery', icon: <Banknote className="w-5 h-5" />, disabled: true },
    { id: 'debit', label: 'Debit Card', icon: <CreditCard className="w-5 h-5" />, disabled: false },
    { id: 'credit', label: 'Credit Card', icon: <CreditCard className="w-5 h-5" />, disabled: false },
];

const SuccessModal = ({ isOpen, onClose, productImage, productName }: { isOpen: boolean, onClose: () => void, productImage: string, productName: string }) => {
    const router = useRouter();

    const Confetti = () => {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
        const confettiCount = 50;

        return (
            <div className="confetti-background">
                {Array.from({ length: confettiCount }).map((_, i) => (
                    <div
                        key={i}
                        className="confetti"
                        style={{
                            left: `${Math.random() * 100}vw`,
                            animationDuration: `${Math.random() * 3 + 4}s`,
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)]
                        }}
                    ></div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0" onPointerDownOutside={(e) => e.preventDefault()} hideCloseButton>
                 {isOpen && <Confetti />}
                 <DialogHeader className="sr-only">
                    <DialogTitle>Purchase Successful</DialogTitle>
                    <DialogDescription>Your order has been confirmed.</DialogDescription>
                </DialogHeader>
                 <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative aspect-[4/5] hidden md:block">
                         <Image 
                            src={productImage || 'https://placehold.co/600x800.png'} 
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
                        <div className="w-full space-y-2">
                             <Button asChild className="w-full">
                                <Link href="/orders">Go to My Orders</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/live-selling">Continue Shopping</Link>
                            </Button>
                             <Button variant="ghost" onClick={() => router.push('/live-selling')} className="w-full">
                                Go Back
                            </Button>
                        </div>
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
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailureAlertOpen, setIsFailureAlertOpen] = useState(false);
  
  const [savedUpiIds, setSavedUpiIds] = useState(['ganeshprajapati@okhdfcbank']);
  const [newUpiId, setNewUpiId] = useState('');
  const [saveUpi, setSaveUpi] = useState(false);
  const [selectedUpi, setSelectedUpi] = useState(savedUpiIds[0] || '');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [showWalletOtp, setShowWalletOtp] = useState(false);
  const [walletOtp, setWalletOtp] = useState('');
  const [upiError, setUpiError] = useState('');


  const [address, setAddress] = useState(userData?.addresses?.[0] || null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);


  const [shippingSettings] = useLocalStorage<ShippingSettings>(SHIPPING_SETTINGS_KEY, defaultShippingSettings);
  const [allOffers, setAllOffers] = useLocalStorage<Coupon[]>(COUPONS_KEY, []);
  const [additionalCharges] = useLocalStorage<AdditionalCharge[]>(ADDITIONAL_CHARGES_KEY, defaultAdditionalCharges);
  
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false);

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
    if (!isClient || !userData) return;

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
    
    if (userData.addresses && userData.addresses.length > 0) {
        setAddress(userData.addresses[0]);
    }
    
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
    
    localStorage.removeItem('buyNow');

  }, [isClient, searchParams, router, toast, userData]);


  const { subtotal, shippingCost, estimatedTaxes, total, couponDiscount, totalAdditionalCharges, applicableCharges } = useMemo(() => {
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
            } else {
                discount = appliedCoupon.discountValue;
            }
        }
    }

    const filteredCharges = additionalCharges.filter(charge => charge.displayLocation.includes('Payment Page'));
    const additionalChargesTotal = filteredCharges.reduce((acc, charge) => {
        if (charge.type === 'fixed') {
            return acc + charge.value;
        }
        if (charge.type === 'percentage') {
            return acc + (sub * (charge.value / 100));
        }
        return acc;
    }, 0);

    const tot = sub - discount + ship + tax + additionalChargesTotal;
    
    return {
        subtotal: sub,
        shippingCost: ship,
        estimatedTaxes: tax,
        total: tot,
        couponDiscount: discount,
        totalAdditionalCharges: additionalChargesTotal,
        applicableCharges: filteredCharges
    };
  }, [cartItems, shippingSettings, appliedCoupon, allOffers, additionalCharges]);

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


  const isPayButtonDisabled = useMemo(() => {
    if (isProcessing) return true;
    if (paymentMethod === 'upi') {
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (newUpiId.trim() && !upiRegex.test(newUpiId.trim())) {
            return true;
        }
        return !newUpiId.trim() && !selectedUpi.trim();
    }
    if (paymentMethod === 'credit' || paymentMethod === 'debit') {
        const { number, expiry, cvv, name } = cardDetails;
        return !number || number.length < 16 || !expiry || expiry.length < 5 || !cvv || cvv.length < 3 || !name;
    }
    return false;
  }, [isProcessing, paymentMethod, newUpiId, selectedUpi, cardDetails]);


  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (!user) return;
    setUpiError('');

    if (paymentMethod === 'upi' && newUpiId.trim()) {
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (!upiRegex.test(newUpiId.trim())) {
            setUpiError('Invalid UPI ID format. It should be like "yourname@bank".');
            return;
        }
    }

    if(isPayButtonDisabled) return;

    if (paymentMethod === 'wallet' && !showWalletOtp) {
        setShowWalletOtp(true);
        return;
    }

    if(paymentMethod === 'wallet' && showWalletOtp) {
        if (walletOtp !== '123456') {
            toast({ variant: "destructive", title: "Invalid OTP", description: "The OTP you entered is incorrect. Please try again." });
            setWalletOtp('');
            return;
        }
    }
    
    // Simulate payment success/failure
    const paymentSuccess = Math.random() > 0.2; // 80% success rate
    
    setIsProcessing(true);
    const transactionId = `#STREAM${Math.floor(100000 + Math.random() * 900000)}`;

    try {
        if (paymentSuccess) {
            const db = getFirestoreDb();
            const batch = writeBatch(db);

            // 1. Create the main order document
            const newOrderRef = doc(collection(db, "orders"));
            const orderData = {
                userId: user.uid,
                products: cartItems.map(item => ({
                    ...item,
                    productId: item.key, 
                    sellerId: productToSellerMapping[item.key as keyof typeof productToSellerMapping]?.uid || null
                })),
                address: address,
                total: total,
                orderDate: serverTimestamp(),
                isReturnable: true,
                timeline: [
                    { status: "Pending", date: format(new Date(), 'MMM dd, yyyy'), time: format(new Date(), 'p'), completed: true },
                    { status: "Order Confirmed", date: null, time: null, completed: false },
                    { status: "Packed", date: null, time: null, completed: false },
                    { status: "Shipped", date: null, time: null, completed: false },
                    { status: "In Transit", date: null, time: null, completed: false },
                    { status: "Out for Delivery", date: null, time: null, completed: false },
                    { status: "Delivered", date: null, time: null, completed: false },
                ],
            };
            batch.set(newOrderRef, orderData);

            // 2. Create order documents for each seller involved
            const ordersBySeller: { [sellerId: string]: any } = {};
            cartItems.forEach(item => {
                const sellerId = productToSellerMapping[item.key as keyof typeof productToSellerMapping]?.uid;
                if (sellerId) {
                    if (!ordersBySeller[sellerId]) {
                        ordersBySeller[sellerId] = [];
                    }
                    ordersBySeller[sellerId].push({ ...item, productId: item.key });
                }
            });

            for (const sellerId in ordersBySeller) {
                const sellerOrderRef = doc(db, `users/${sellerId}/orders`, newOrderRef.id);
                const sellerOrderData = {
                    ...orderData,
                    orderId: newOrderRef.id,
                    products: ordersBySeller[sellerId],
                    sellerId: sellerId,
                    total: ordersBySeller[sellerId].reduce((sum: number, item: any) => sum + parseFloat(item.price.replace(/[^0-9.-]+/g, '')) * item.quantity, 0)
                };
                batch.set(sellerOrderRef, sellerOrderData);
            }
            
            await batch.commit();

            addTransaction({
                id: Date.now(),
                transactionId: newOrderRef.id,
                type: 'Order',
                description: `Paid via ${paymentMethod}`,
                date: format(new Date(), 'MMM dd, yyyy'),
                time: format(new Date(), 'p'),
                amount: -total,
                status: 'Completed',
            });
            
            localStorage.removeItem('streamcart_cart');
            localStorage.removeItem('appliedCoupon');
            window.dispatchEvent(new Event('storage'));
            setIsSuccessModalOpen(true);
        } else {
            throw new Error("Simulated payment failure.");
        }
    } catch (error) {
        console.error("Error placing order:", error);
        addTransaction({
            id: Date.now(),
            transactionId: transactionId,
            type: 'Order',
            description: `Paid via ${paymentMethod}`,
            date: format(new Date(), 'MMM dd, yyyy'),
            time: format(new Date(), 'p'),
            amount: -total,
            status: 'Failed',
        });
        setIsFailureAlertOpen(true);
    } finally {
        setIsProcessing(false);
    }
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
    saveCart(cartItems);
    if(appliedCoupon) {
        localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
        localStorage.removeItem('appliedCoupon');
    }
    router.push('/payment');
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

  if (!isClient || loading || cartItems.length === 0) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>
  }

  if(!user) {
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
                    {savedUpiIds.length > 0 && (
                        <RadioGroup value={selectedUpi} onValueChange={(value) => { setSelectedUpi(value); setNewUpiId(''); setUpiError(''); }} className="space-y-2">
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
                        <Input id="upi-id" placeholder="name@bank" value={newUpiId} onChange={e => { setNewUpiId(e.target.value); setSelectedUpi(''); setUpiError('') }} />
                        {upiError && <p className="text-xs text-destructive">{upiError}</p>}
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
                    <Button type="submit" size="lg" className="w-full" disabled={isPayButtonDisabled}>
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
                            <Input id="card-number" placeholder="1234 5678 9012 3456" value={cardDetails.number} onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))} maxLength={16} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="expiry">Expiry</Label>
                            <Input id="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))} maxLength={5} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" type="password" placeholder="•••" value={cardDetails.cvv} onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))} maxLength={3} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="name">Name on Card</Label>
                        <Input id="name" placeholder="Full name" value={cardDetails.name} onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    {paymentMethod === 'credit' && <p className="text-xs text-muted-foreground">We do not store your card details.</p>}
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground flex items-center gap-2"><Lock className="h-3 w-3"/> Secured by 3D Secure</p>
                        <Button type="submit" size="lg" disabled={isPayButtonDisabled}>
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
     <AlertDialog open={isFailureAlertOpen} onOpenChange={setIsFailureAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">Transaction Failed</AlertDialogTitle>
                <AlertDialogDescription>
                    Your payment could not be processed. Please try again with a different payment method or check your details. Your items are still in your cart.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsFailureAlertOpen(false)}>Try Again</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
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
                                         onClick={() => {
                                             setPaymentMethod(method.id as PaymentMethod);
                                             setShowWalletOtp(false); // Reset OTP state when changing method
                                         }}
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

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    Delivery Address
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

                     <div className="p-4 mt-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                        <Button variant="link" className="text-xs text-muted-foreground hover:text-primary px-2" onClick={() => toast({ title: "Report Sent", description: "Thank you for your feedback." })}>Report</Button>
                        <FeedbackDialog>
                            <Button variant="link" className="text-xs text-muted-foreground hover:text-primary px-2">Feedback</Button>
                        </FeedbackDialog>
                        <Button asChild variant="link" className="text-xs text-muted-foreground hover:text-primary px-2"><Link href="/contact">Contact Us</Link></Button>
                        <Button asChild variant="link" className="text-xs text-muted-foreground hover:text-primary px-2"><Link href="/help">Help</Link></Button>
                    </div>

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
                                {cartItems.map((item) => {
                                    const details = productDetails[item.key as keyof typeof productDetails];
                                    const hasDiscount = details && details.discountPercentage && details.discountPercentage > 0;
                                    const itemPrice = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
                                    const originalPrice = hasDiscount ? itemPrice / (1 - details.discountPercentage / 100) : itemPrice;
                                    
                                    return (
                                        <div key={`${''}${item.id}-${item.size || ''}-${item.color || ''}`} className="flex items-start gap-4">
                                            <div className="relative w-16 h-16 rounded-md border flex-shrink-0">
                                                <Image src={item.imageUrl || 'https://placehold.co/100x100.png'} alt={item.name} layout="fill" className="object-cover rounded-md" data-ai-hint={item.hint}/>
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-sm leading-tight truncate">{item.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {item.size && <span>Size: {item.size}</span>}
                                                    {item.size && item.color && <span className="mx-1">|</span>}
                                                    {item.color && <span>Color: {item.color}</span>}
                                                </div>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                 {hasDiscount && (
                                                    <div className="flex items-center gap-x-2 mt-1">
                                                        <p className="text-xs text-muted-foreground line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
                                                        <Badge variant="destructive" className="text-[10px]">
                                                            {details.discountPercentage}% OFF
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-semibold text-sm">₹{itemPrice.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <Separator className="my-4" />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {applicableCharges.map(charge => (
                                <div key={charge.id} className="flex justify-between">
                                    <span className="text-muted-foreground">{charge.name}</span>
                                    <span>+ ₹{charge.type === 'fixed' ? charge.value.toFixed(2) : (subtotal * charge.value / 100).toFixed(2)}</span>
                                </div>
                                ))}
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
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        Tax
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Info className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <p className="text-sm">Taxes are calculated based on your shipping address and include GST (2.5%) and SGST (2.5%) on the subtotal.</p>
                                            </PopoverContent>
                                        </Popover>
                                    </span>
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
        
        {isHelpChatOpen && (
            <HelpChat
                order={null}
                onClose={() => setIsHelpChatOpen(false)}
                initialOptions={["Payment issue", "Delivery inquiry", "Problem with an item", "Talk to a support executive"]}
            />
        )}
    </div>
    </>
  );
}
