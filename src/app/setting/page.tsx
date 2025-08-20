
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Banknote, CreditCard, Landmark, Loader2, Plus, Trash2, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/footer';

const bankAccountSchema = z.object({
    accountHolderName: z.string().min(1, "Account holder name is required."),
    accountNumber: z.string().min(9, "Account number is too short").max(18, "Account number is too long"),
    ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format."),
});

const withdrawalSchema = z.object({
    amount: z.coerce.number().positive("Amount must be positive.").max(5000, "Maximum withdrawal amount is ₹5,000."),
    accountId: z.string().min(1, "Please select a bank account."),
});

type BankAccount = z.infer<typeof bankAccountSchema> & { id: string };

export default function SettingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [sellerDetails, setSellerDetails] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { toast } = useToast();

  const accountForm = useForm<z.infer<typeof bankAccountSchema>>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { accountHolderName: "", accountNumber: "", ifsc: "" },
  });

  const withdrawalForm = useForm<z.infer<typeof withdrawalSchema>>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: { amount: 0, accountId: "" },
  });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        const storedSellerDetails = localStorage.getItem('sellerDetails');
        if (storedSellerDetails) {
            const details = JSON.parse(storedSellerDetails);
            setSellerDetails(details);
            const initialAccount: BankAccount = {
                id: 'initial-account',
                accountHolderName: details.name,
                accountNumber: details.accountNumber,
                ifsc: details.ifsc,
            };
            setBankAccounts([initialAccount]);
        }
    }
  }, []);

  const handleAddAccount = (values: z.infer<typeof bankAccountSchema>) => {
    const newAccount: BankAccount = { ...values, id: `acc_${Date.now()}` };
    setBankAccounts([...bankAccounts, newAccount]);
    toast({ title: "Success", description: "New bank account added." });
    setIsAddAccountOpen(false);
    accountForm.reset();
  };

  const handleDeleteAccount = (accountId: string) => {
    if (bankAccounts.length <= 1) {
        toast({ variant: 'destructive', title: "Action Forbidden", description: "You must have at least one bank account." });
        return;
    }
    setBankAccounts(bankAccounts.filter(acc => acc.id !== accountId));
    toast({ title: "Success", description: "Bank account removed." });
  };
  
  const handleWithdrawal = async (values: z.infer<typeof withdrawalSchema>) => {
    withdrawalForm.formState.isSubmitting = true;
    await new Promise(resolve => setTimeout(resolve, 1500));
    withdrawalForm.formState.isSubmitting = false;

    toast({ title: "Withdrawal Initiated", description: `₹${values.amount} is on its way to your account.` });
    setIsWithdrawOpen(false);
    withdrawalForm.reset();
  }

  if (loading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your settings.</p>
        <Button onClick={() => router.push('/')}>Go to Login</Button>
      </div>
    );
  }

  const maskNumber = (num: string, keep: number) => {
    return '•'.repeat(num.length - keep) + num.slice(-keep);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Wallet</CardTitle>
                    <CardDescription>View your balance and manage withdrawals.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className='space-y-1'>
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-3xl font-bold">₹5,000.00</p>
                    </div>
                    <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                        <DialogTrigger asChild>
                            <Button>Withdraw Balance</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Withdraw Funds</DialogTitle>
                                <DialogDescription>Select an account and enter the amount to withdraw.</DialogDescription>
                            </DialogHeader>
                             <Form {...withdrawalForm}>
                                <form onSubmit={withdrawalForm.handleSubmit(handleWithdrawal)} className="space-y-4">
                                    <FormField
                                        control={withdrawalForm.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount (Max: ₹5,000)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 1500" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={withdrawalForm.control}
                                        name="accountId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Select Account</FormLabel>
                                                <FormControl>
                                                   <div className="space-y-2">
                                                        {bankAccounts.map((account) => (
                                                            <div 
                                                                key={account.id} 
                                                                onClick={() => field.onChange(account.id)}
                                                                className={cn("p-3 border rounded-md cursor-pointer flex items-center gap-4 hover:border-primary", field.value === account.id && "border-primary ring-2 ring-primary")}
                                                            >
                                                                <Landmark className="h-6 w-6 text-muted-foreground" />
                                                                <div>
                                                                    <p className="font-semibold">{account.accountHolderName}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {maskNumber(account.accountNumber, 4)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                   </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setIsWithdrawOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={withdrawalForm.formState.isSubmitting}>
                                            {withdrawalForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Withdraw Now
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Identity Verification</CardTitle>
                    <CardDescription>These details are used for seller verification and payouts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                           <CreditCard className="h-5 w-5 text-muted-foreground"/>
                           <div>
                                <p className="text-sm font-medium">PAN Card</p>
                                <p className="text-sm text-muted-foreground font-mono">{sellerDetails ? `••••••${sellerDetails.pan.slice(-4)}` : 'N/A'}</p>
                           </div>
                        </div>
                         <Button variant="secondary" size="sm" disabled>Verified</Button>
                    </div>
                     <div className="flex justify-between items-center p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                           <CreditCard className="h-5 w-5 text-muted-foreground"/>
                           <div>
                                <p className="text-sm font-medium">Aadhar Card</p>
                                <p className="text-sm text-muted-foreground font-mono">{sellerDetails ? `•••• •••• ${sellerDetails.aadhar.slice(-4)}` : 'N/A'}</p>
                           </div>
                        </div>
                         <Button variant="secondary" size="sm" disabled>Verified</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Bank Accounts for Withdrawal</CardTitle>
                            <CardDescription>Manage your bank accounts for receiving payments.</CardDescription>
                        </div>
                        <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><Plus className="mr-2 h-4 w-4"/> Add New</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Bank Account</DialogTitle>
                                    <DialogDescription>
                                        Enter the details of the bank account you want to link.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...accountForm}>
                                    <form onSubmit={accountForm.handleSubmit(handleAddAccount)} className="space-y-4">
                                        <FormField
                                            control={accountForm.control}
                                            name="accountHolderName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Account Holder Name</FormLabel>
                                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={accountForm.control}
                                            name="accountNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Account Number</FormLabel>
                                                    <FormControl><Input placeholder="Enter account number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={accountForm.control}
                                            name="ifsc"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>IFSC Code</FormLabel>
                                                    <FormControl><Input placeholder="Enter IFSC code" {...field} className="uppercase" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <Button type="button" variant="ghost" onClick={() => setIsAddAccountOpen(false)}>Cancel</Button>
                                            <Button type="submit">Add Account</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {bankAccounts.map(account => (
                        <div key={account.id} className="flex justify-between items-center p-3 border rounded-md">
                            <div className="flex items-center gap-4">
                               <Banknote className="h-6 w-6 text-muted-foreground"/>
                               <div>
                                    <p className="text-sm font-medium">{account.accountHolderName}</p>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        Account: •••••{account.accountNumber.slice(-4)}
                                    </p>
                               </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAccount(account.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
