
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Image from "next/image";

// Add Bank Account Form
const addBankFormSchema = z.object({
  accountHolderName: z.string().min(2, "Name is required."),
  accountNumber: z.string().min(9, "Account number is too short").max(18, "Account number is too long"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format."),
  bankName: z.string().min(2, "Bank name is required."),
});

interface AddBankFormProps {
    onSave: (data: z.infer<typeof addBankFormSchema>) => void;
    onComplete?: () => void; // Optional: to switch tabs
}

export function AddBankForm({ onSave, onComplete }: AddBankFormProps) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof addBankFormSchema>>({
        resolver: zodResolver(addBankFormSchema),
        defaultValues: { accountHolderName: "", accountNumber: "", ifsc: "", bankName: "" },
    });

    const onSubmit = (values: z.infer<typeof addBankFormSchema>) => {
        onSave(values);
        form.reset();
        if (onComplete) {
            onComplete();
        } else {
             document.getElementById('closeDialog')?.click();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="accountHolderName" render={({ field }) => (
                    <FormItem><FormLabel>Account Holder Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="accountNumber" render={({ field }) => (
                    <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ifsc" render={({ field }) => (
                    <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input {...field} className="uppercase" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bankName" render={({ field }) => (
                    <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter className="pt-4">
                    {onComplete ? (
                         <Button type="submit" className="w-full">Add Account</Button>
                    ) : (
                        <>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" id="closeDialog">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Add Account</Button>
                        </>
                    )}
                </DialogFooter>
            </form>
        </Form>
    );
}


// Withdraw Form
const createWithdrawFormSchema = (cashAvailable: number) => z.object({
  amount: z.coerce.number()
    .positive("Amount must be greater than 0.")
    .max(cashAvailable, `Withdrawal amount cannot exceed available cash of ₹${cashAvailable.toFixed(2)}.`),
  bankAccountId: z.string({ required_error: "You must select a bank account." }),
});


interface WithdrawFormProps {
    onWithdraw: (amount: number, bankAccountId: string) => void;
    onAddAccount: (account: z.infer<typeof addBankFormSchema>) => void;
}

export function WithdrawForm({ onWithdraw, onAddAccount }: WithdrawFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("withdraw");
    
    // This is mock data. In a real app, you'd fetch this from your backend.
    const mockCashAvailable = 52340.50;
    const mockBankAccounts = [
      { id: 1, bankName: "HDFC Bank", accountNumber: "XXXX-XXXX-XX12-3456" }
    ];
    
    const withdrawFormSchema = createWithdrawFormSchema(mockCashAvailable);

    const form = useForm<z.infer<typeof withdrawFormSchema>>({
        resolver: zodResolver(withdrawFormSchema),
    });

    const onSubmit = (values: z.infer<typeof withdrawFormSchema>) => {
        setIsLoading(true);
        
        setTimeout(() => {
            setIsLoading(false);
            onWithdraw(values.amount, values.bankAccountId);
            document.getElementById('closeWithdrawDialog')?.click();
        }, 1500);
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                <TabsTrigger value="add-bank">Add Account</TabsTrigger>
            </TabsList>
            <TabsContent value="withdraw">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount (Available: ₹{mockCashAvailable.toFixed(2)})</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                        <Input type="number" placeholder="0.00" className="pl-6" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="bankAccountId" render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Select Bank Account</FormLabel>
                                {mockBankAccounts.length > 0 ? (
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                        {mockBankAccounts.map(account => (
                                            <FormItem key={account.id} className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-primary/10">
                                                <FormControl>
                                                    <RadioGroupItem value={String(account.id)} />
                                                </FormControl>
                                                <FormLabel className="font-normal w-full cursor-pointer">
                                                    <div className="flex justify-between items-center">
                                                        <span>{account.bankName}</span>
                                                        <span className="text-muted-foreground font-mono text-xs">{account.accountNumber}</span>
                                                    </div>
                                                </FormLabel>
                                            </FormItem>
                                        ))}
                                        </RadioGroup>
                                    </FormControl>
                                ) : (
                                    <div className="text-center text-muted-foreground p-4 border rounded-md">
                                        <p>No bank accounts found.</p>
                                        <Button variant="link" onClick={() => setActiveTab('add-bank')}>Add one now</Button>
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" id="closeWithdrawDialog">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading || mockBankAccounts.length === 0}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Withdrawal
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </TabsContent>
            <TabsContent value="add-bank">
                <AddBankForm onSave={onAddAccount} onComplete={() => setActiveTab('withdraw')} />
            </TabsContent>
        </Tabs>
    );
}

// Add Payment Method Form
const addPaymentMethodSchema = z.object({
    cardNumber: z.string().min(16, "Invalid card number").max(16, "Invalid card number"),
    cardHolderName: z.string().min(2, "Name is required."),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid format. Use MM/YY."),
    cvv: z.string().min(3, "Invalid CVV").max(3, "Invalid CVV"),
});

interface AddPaymentMethodProps {
    onSave: (data: z.infer<typeof addPaymentMethodSchema>) => void;
}

export function AddPaymentMethodForm({ onSave }: AddPaymentMethodProps) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof addPaymentMethodSchema>>({
        resolver: zodResolver(addPaymentMethodSchema),
        defaultValues: { cardNumber: "", cardHolderName: "", expiryDate: "", cvv: "" },
    });

    const onSubmit = (values: z.infer<typeof addPaymentMethodSchema>) => {
        onSave(values);
        form.reset();
        document.getElementById('closePaymentDialog')?.click();
    };

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Card</DialogTitle>
                <DialogDescription>Your payment information is stored securely.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField control={form.control} name="cardNumber" render={({ field }) => (
                        <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input type="text" maxLength={16} placeholder="•••• •••• •••• ••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="cardHolderName" render={({ field }) => (
                        <FormItem><FormLabel>Cardholder Name</FormLabel><FormControl><Input placeholder="Name as it appears on card" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="expiryDate" render={({ field }) => (
                            <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="cvv" render={({ field }) => (
                            <FormItem><FormLabel>CVV</FormLabel><FormControl><Input type="password" maxLength={3} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                           <Button type="button" variant="secondary" id="closePaymentDialog">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Card</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

// Add UPI Form
const addUpiFormSchema = z.object({
  upiId: z.string().regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Please enter a valid UPI ID (e.g., yourname@bank)."),
});

interface AddUpiFormProps {
    onSave: (data: z.infer<typeof addUpiFormSchema>) => void;
}

export function AddUpiForm({ onSave }: AddUpiFormProps) {
    const form = useForm<z.infer<typeof addUpiFormSchema>>({
        resolver: zodResolver(addUpiFormSchema),
        defaultValues: { upiId: "" },
    });

    const onSubmit = (values: z.infer<typeof addUpiFormSchema>) => {
        onSave(values);
        form.reset();
        document.getElementById('closeUpiDialog')?.click();
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New UPI ID</DialogTitle>
                <DialogDescription>Link your UPI ID for fast and easy payments.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField control={form.control} name="upiId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>UPI ID</FormLabel>
                            <FormControl>
                                 <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Image src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI Logo" width={20} height={20} />
                                    </div>
                                    <Input placeholder="yourname@bank" {...field} className="pl-10" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                           <Button type="button" variant="secondary" id="closeUpiDialog">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save UPI ID</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}
