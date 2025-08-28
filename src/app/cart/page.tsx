
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Home, Edit, Tag, Ticket, Star, Users, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getCart, removeFromCart, updateCartQuantity, CartProduct } from '@/lib/product-history';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { format, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditAddressForm } from '@/components/edit-address-form';
import { productDetails } from '@/lib/product-data';

const mockAddress = {
    name: "Samael Prajapati",
    village: "Koregaon Park",
    district: "Pune",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    phone: "+91 9876543210"
};

const mockCoupons = [
    { code: 'STREAM10', description: '10% off on all orders', discount: 0.10, type: 'percentage' },
    { code: 'SAVE100', description: '₹100 off on orders above ₹1000', discount: 100, type: 'fixed' },
];

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

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [address, setAddress] = useState(mockAddress);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<typeof mockCoupons[0] | null>(null);

  const buyNowProductId = searchParams.get('productId');
  const isBuyNow = searchParams.get('buyNow') === 'true';

  useEffect(() => {
    setIsClient(true);
    if (user) {
      if (isBuyNow && buyNowProductId) {
        const productData = productDetails[buyNowProductId as keyof typeof productDetails];
        if (productData) {
          const buyNowItem: CartProduct = {
            ...productData,
            quantity: 1,
            imageUrl: productData.images[0]
          };
          setCartItems([buyNowItem]);
        }
      } else {
        setCartItems(getCart());
      }
    }
  }, [user, isBuyNow, buyNowProductId]);

  const handleRemoveFromCart = (productId: number) => {
    removeFromCart(productId);
    setCartItems(getCart());
    toast({
      title: "Item Removed",
      description: "The item has been removed from your cart.",
    });
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
      if (isBuyNow) {
          setCartItems(currentItems => 
              currentItems.map(item => 
                  item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
              )
          );
      } else {
          updateCartQuantity(productId, newQuantity);
          setCartItems(getCart());
      }
  };

  const handleAddressSave = (newAddress: any) => {
    setAddress(newAddress);
    setIsAddressDialogOpen(false);
    toast({
        title: "Address Updated!",
        description: "Your delivery address has been changed."
    })
  };

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
    if (appliedCoupon.type === 'percentage') {
        return subtotal * appliedCoupon.discount;
    }
    if (appliedCoupon.type === 'fixed' && subtotal > 1000) {
        return appliedCoupon.discount;
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const shippingCost = 50.00;
  const total = subtotal - couponDiscount + shippingCost;
  const estimatedDeliveryDate = useMemo(() => format(addDays(new Date(), 5), 'E, MMM dd, yyyy'), []);

  const handleApplyCoupon = (coupon: typeof mockCoupons[0]) => {
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
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast({
        title: "Coupon Removed",
        description: "The coupon has been removed from your order."
    });
  };


   if (loading || !isClient) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  if (!user) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">Please log in to view your cart.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
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
                                        <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <Link href={`/product/${item.key}`} className="block flex-shrink-0">
                                                <Image src={item.imageUrl} alt={item.name} width={100} height={100} className="rounded-lg object-cover" data-ai-hint={item.hint} />
                                            </Link>
                                            <div className="flex-grow">
                                                <Link href={`/product/${item.key}`} className="hover:underline">
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                </Link>
                                                <p className="text-sm text-muted-foreground">{item.price}</p>
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
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="font-bold w-24 text-right">
                                                ₹{(parseFloat(item.price.replace('₹', '').replace(/,/g, '')) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            {!isBuyNow && (
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => handleRemoveFromCart(item.id)}>
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
                                <CardTitle>Price Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {appliedCoupon && (
                                     <div className="flex justify-between items-center text-success">
                                        <span className="flex items-center gap-1.5"><Tag className="h-4 w-4"/> Coupon ({appliedCoupon.code})</span>
                                        <div className="flex items-center gap-1">
                                            <span>- ₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={handleRemoveCoupon}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Charges</span>
                                    <span>₹{shippingCost.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Amount</span>
                                    <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg">Proceed to Checkout</Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Available Coupons</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               {mockCoupons.map(coupon => (
                                <div key={coupon.code} className="flex items-center justify-between p-3 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                                    <div className="flex items-center gap-3">
                                        <Ticket className="h-6 w-6 text-primary" />
                                        <div>
                                            <p className="font-bold text-primary">{coupon.code}</p>
                                            <p className="text-xs text-muted-foreground">{coupon.description}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleApplyCoupon(coupon)} disabled={appliedCoupon?.code === coupon.code}>
                                        {appliedCoupon?.code === coupon.code ? 'Applied' : 'Apply'}
                                    </Button>
                                </div>
                               ))}
                            </CardContent>
                        </Card>
                        
                        <Card>
                             <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        Delivery To
                                    </CardTitle>
                                     <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm"><Edit className="mr-2 h-3 w-3" /> Change</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Change Delivery Address</DialogTitle>
                                            </DialogHeader>
                                            <EditAddressForm onSave={handleAddressSave} onCancel={() => setIsAddressDialogOpen(false)} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                 <CardDescription>Your order will be delivered to this address. Select any address it will reach to that destination with {address.pincode}</CardDescription>
                            </CardHeader>
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
                        </Card>
                     </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
