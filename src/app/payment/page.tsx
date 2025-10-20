
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, ShieldCheck, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Image from 'next/image';

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // Mock data that would come from the previous page
  const subtotal = 12500;
  const couponDiscount = 1250;
  const shippingCost = 50;
  const estimatedTaxes = (subtotal - couponDiscount) * 0.05;
  const total = subtotal - couponDiscount + shippingCost + estimatedTaxes;

  const handlePlaceOrder = () => {
    toast({
      title: "Order Placed!",
      description: "Your order has been successfully placed. Thank you for shopping with StreamCart!",
    });
    // In a real app, you'd clear the cart here
    router.push('/orders'); // Redirect to orders page
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Payment</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                            <Label htmlFor="credit-card" className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                                <RadioGroupItem value="credit-card" id="credit-card" />
                                <CreditCard className="h-6 w-6 text-primary" />
                                <div className="flex-grow">
                                    <p className="font-semibold">Credit/Debit Card</p>
                                    <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay & more</p>
                                </div>
                            </Label>
                             <Label htmlFor="upi" className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                                <RadioGroupItem value="upi" id="upi" />
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" width={24} height={24} />
                                <div className="flex-grow">
                                    <p className="font-semibold">UPI</p>
                                    <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm & more</p>
                                </div>
                            </Label>
                             <Label htmlFor="pod" className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                                <RadioGroupItem value="pod" id="pod" />
                                <Banknote className="h-6 w-6 text-primary" />
                                <div className="flex-grow">
                                    <p className="font-semibold">Pay on Delivery</p>
                                    <p className="text-xs text-muted-foreground">Pay with cash at your doorstep</p>
                                </div>
                            </Label>
                        </RadioGroup>
                    </CardContent>
                </Card>
            </div>
             <div className="lg:sticky top-24 space-y-6">
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
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span>Discount</span>
                                <span>- ₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
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
                    <CardFooter className="flex-col items-stretch gap-4">
                        <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                            Place Order
                        </Button>
                        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            Safe and secure payments. 100% Authentic products.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
