

"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Shield, Bell, HelpCircle, LogOut, Trash2, Loader2, AlertTriangle, MessageSquare, ShieldAlert, KeyRound, Smartphone, Monitor, Globe, Palette, Home, Plus, Wallet, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthActions } from '@/lib/auth';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemePicker } from '@/components/theme-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { EditProfileForm } from '@/components/edit-profile-form';
import { EditAddressForm } from '@/components/edit-address-form';
import { updateUserData } from '@/lib/follow-data';
import { AddBankForm, AddPaymentMethodForm, AddUpiForm } from '@/components/settings-forms';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


const surveyReasons = [
    "I'm not using StreamCart anymore",
    "I'm switching to a different platform",
    "I have privacy concerns",
    "I receive too many notifications",
    "I had a bad experience",
    "Other"
];

const mockLoginActivity = [
    { id: 1, device: "Chrome on Windows", location: "Pune, IN", time: "Active now", isCurrent: true, icon: <Monitor /> },
    { id: 2, device: "StreamCart App on Android", location: "Mumbai, IN", time: "2 hours ago", icon: <Smartphone /> },
    { id: 3, device: "Safari on macOS", location: "Delhi, IN", time: "1 day ago", icon: <Globe /> },
];

const initialTransactions = [
    { name: 'Ganesh Prajapati', date: '27 July, 2024', time: '10:30 PM', amount: -5000.00, avatar: 'https://placehold.co/40x40.png' },
    { name: 'Jane Doe', date: '26 July, 2024', time: '08:15 AM', amount: -250.00, avatar: 'https://placehold.co/40x40.png' },
    { name: 'Monthly Savings', date: '25 July, 2024', time: '09:00 AM', amount: 10000.00, avatar: 'https://placehold.co/40x40.png' },
    { name: 'Alex Smith', date: '24 July, 2024', time: '07:45 PM', amount: -1200.00, avatar: 'https://placehold.co/40x40.png' },
];

function DeleteAccountFlow() {
    const [step, setStep] = useState(1);
    const [reason, setReason] = useState("");
    const [otp, setOtp] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const { signOut } = useAuthActions();

    const handleConfirmDeletion = () => {
        if (otp !== '123456') {
            toast({ variant: 'destructive', title: "Invalid OTP", description: "The OTP entered is incorrect." });
            return;
        }

        setIsDeleting(true);
        toast({ title: "Deleting Account...", description: "Your account and data are being permanently removed." });

        // Simulate backend deletion
        setTimeout(() => {
            setIsDeleting(false);
            signOut();
            toast({ title: "Account Deleted", description: "Your account has been successfully deleted." });
        }, 2000);
    };

    if (step === 1) {
        return (
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. All your data, including order history, reviews, and profile information, will be permanently deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setStep(2)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        );
    }
    
    if (step === 2) {
         return (
             <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>We're sad to see you go</AlertDialogTitle>
                    <AlertDialogDescription>Please tell us why you are leaving. Your feedback is valuable.</AlertDialogDescription>
                </AlertDialogHeader>
                 <div className="space-y-2 py-4">
                    {surveyReasons.map(r => (
                        <div key={r} className="flex items-center">
                            <input type="radio" id={r} name="reason" value={r} onChange={(e) => setReason(e.target.value)} className="h-4 w-4" />
                            <Label htmlFor={r} className="ml-2">{r}</Label>
                        </div>
                    ))}
                 </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setStep(1)}>Back</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setStep(3)} disabled={!reason}>Next</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
         );
    }
    
    if (step === 3) {
         return (
             <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Final Confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                        To confirm deletion, please enter the OTP sent to your registered mobile number.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                     <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setStep(2)}>Back</AlertDialogCancel>
                    <AlertDialogAction 
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        onClick={handleConfirmDeletion}
                        disabled={otp.length !== 6 || isDeleting}
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete My Account Permanently
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
         );
    }

    return null;
}


export default function SettingsPage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    const { signOut, updateUserProfile } = useAuthActions();
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();
    
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [upiIds, setUpiIds] = useState<any[]>([]);

    const handleToggle = (setting: string, enabled: boolean) => {
        toast({
            title: "Setting Saved",
            description: `${setting} notifications have been ${enabled ? 'enabled' : 'disabled'}.`
        });
    };

    useEffect(() => {
        setIsMounted(true);
         if (user) {
            fetchBankAccounts(user.uid);
            fetchPaymentMethods(user.uid);
            fetchUpiIds(user.uid);
        }
    }, [user]);
    
    const fetchBankAccounts = async (userId: string) => {
        // In a real app, this would be an API call to your getBankAccounts function
        // For now, we will use mock data
        const mockAccounts = [
            { id: 1, bankName: "HDFC Bank", accountNumber: "Ending in 3456" },
        ];
        setBankAccounts(mockAccounts);
    }
    
     const fetchPaymentMethods = (userId: string) => {
        // Mock fetching payment methods
        const mockMethods = [
            { id: 1, type: 'Credit Card', provider: 'Visa', last4: '1234', isDefault: true },
        ];
        setPaymentMethods(mockMethods);
    };

    const fetchUpiIds = (userId: string) => {
        // Mock fetching UPI IDs
        const mockUpi = [
            { id: 1, upiId: 'user@bank', isDefault: true },
        ];
        setUpiIds(mockUpi);
    };

    const handleAddBankAccount = async (data: any) => {
        if (!user) return;
        
        // Mocking the API call
        const newAccount = {
            id: Date.now(),
            bankName: data.bankName,
            accountNumber: `Ending in ${data.accountNumber.slice(-4)}`
        };
        setBankAccounts(prev => [...prev, newAccount]);
        
        toast({
            title: "Bank Account Added",
            description: `${data.bankName} has been successfully linked.`
        });
    };

    const handleAddPaymentMethod = (data: any) => {
        const newMethod = {
            id: Date.now(),
            type: 'Credit Card',
            provider: 'Visa', // This would be detected from card number in a real app
            last4: data.cardNumber.slice(-4),
            isDefault: paymentMethods.length === 0,
        };
        setPaymentMethods(prev => [...prev, newMethod]);
         toast({
            title: "Payment Method Added",
            description: `Card ending in ${newMethod.last4} has been saved.`
        });
    };
    
    const handleAddUpi = (data: any) => {
        const newUpi = {
            id: Date.now(),
            upiId: data.upiId,
            isDefault: upiIds.length === 0,
        };
        setUpiIds(prev => [...prev, newUpi]);
        toast({
            title: "UPI ID Added",
            description: `${data.upiId} has been successfully linked.`
        });
    }
    
    const handleProfileSave = async (data: any) => {
      if (user) {
          const updatedData: Partial<any> = {
              displayName: `${data.firstName} ${data.lastName}`,
              bio: data.bio,
              location: data.location,
              phone: `+91 ${data.phone}`,
              photoURL: data.photoURL,
          };
          
          await updateUserProfile(user, updatedData);
          setIsProfileDialogOpen(false);
      }
    };
    
    const handleAddressesUpdate = (newAddresses: any[]) => {
      if(user){
        updateUserData(user.uid, { addresses: newAddresses });
        toast({ title: 'Addresses Updated' });
      }
    }
    
    const handleSelectAddress = (address: any) => {
        // This is a bit of a placeholder, as the main address selection happens in the cart.
        // But we can confirm to the user.
        toast({ title: 'Default Address Set', description: 'This will be used for future checkouts.'});
        setIsAddressDialogOpen(false);
    }

    if (!isMounted || loading || !userData) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
    }

    if (!user) {
        router.replace('/');
        return null;
    }

    const settingsItems = [
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support', href: '/help' },
    ];

    return (
        <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Settings</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-grow p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <Tabs defaultValue="account">
                        <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-4">
                            <TabsTrigger value="account"><User className="mr-2 h-4 w-4" /> Account</TabsTrigger>
                            <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" /> Appearance</TabsTrigger>
                            <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" /> Security</TabsTrigger>
                            <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="account" className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Information</CardTitle>
                                    <CardDescription>Manage your public profile and personal information.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" className="w-full justify-start text-base p-4 h-auto">
                                                    <User className="w-5 h-5" />
                                                    <span className="ml-4">Edit Profile</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-lg w-[95vw] h-auto max-h-[85vh] flex flex-col p-0 rounded-lg">
                                                <DialogHeader className="p-6 pb-4">
                                                    <DialogTitle>Edit Profile</DialogTitle>
                                                </DialogHeader>
                                                 <EditProfileForm 
                                                    currentUser={userData}
                                                    onSave={handleProfileSave}
                                                    onCancel={() => setIsProfileDialogOpen(false)}
                                                 />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" className="w-full justify-start text-base p-4 h-auto">
                                                    <Home className="w-5 h-5" />
                                                    <span className="ml-4">Manage Addresses</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-lg h-auto max-h-[85vh] flex flex-col">
                                                <DialogHeader>
                                                    <DialogTitle>Manage Delivery Addresses</DialogTitle>
                                                    <DialogDescription>Add, edit, or remove your saved addresses.</DialogDescription>
                                                </DialogHeader>
                                                <EditAddressForm
                                                    onSave={handleSelectAddress}
                                                    onCancel={() => setIsAddressDialogOpen(false)}
                                                    onAddressesUpdate={handleAddressesUpdate}
                                                />
                                            </DialogContent>
                                        </Dialog>

                                        {settingsItems.map(item => (
                                            <Button key={item.label} variant="ghost" className="w-full justify-start text-base p-4 h-auto" asChild>
                                                <Link href={item.href}>
                                                    {item.icon}
                                                    <span className="ml-4">{item.label}</span>
                                                </Link>
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="appearance" className="space-y-8">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ThemePicker />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Login & Security</CardTitle>
                                    <CardDescription>Manage your password, authentication, and active sessions.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <Label htmlFor="change-password" className="font-semibold flex items-center gap-3"><KeyRound/> Change Password</Label>
                                        <Button id="change-password" variant="outline" size="sm" asChild>
                                            <Link href="/forgot-password">Change</Link>
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <Label htmlFor="2fa" className="font-semibold flex items-center gap-3"><Smartphone/> Two-Factor Authentication</Label>
                                        <Switch id="2fa" onCheckedChange={(checked) => handleToggle('2FA', checked)} />
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-2">Login Activity</h4>
                                        <ul className="space-y-3">
                                            {mockLoginActivity.map(activity => (
                                                <li key={activity.id} className="flex items-center gap-3 text-sm">
                                                    <div className="text-muted-foreground">{activity.icon}</div>
                                                    <div className="flex-grow">
                                                        <p className="font-medium">{activity.device}</p>
                                                        <p className="text-xs text-muted-foreground">{activity.location} - {activity.time}</p>
                                                    </div>
                                                    {activity.isCurrent && <Badge variant="success">Active</Badge>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout From All Devices
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will log you out of all other active sessions on all devices. You will remain logged in on this device.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => toast({title: "Success", description: "You have been logged out from all other devices."})}>Confirm</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Danger Zone</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
                                        <div>
                                            <h4 className="font-semibold text-destructive">Delete Account</h4>
                                            <p className="text-xs text-destructive/80">Permanently delete your account and all associated data.</p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <DeleteAccountFlow />
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                         <TabsContent value="notifications" className="space-y-8">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                     <CardDescription>Choose what you want to be notified about.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <Label htmlFor="email-notifications" className="font-semibold flex items-center gap-2">Email Notifications</Label>
                                        <Switch id="email-notifications" onCheckedChange={(checked) => handleToggle('Email notifications', checked)} defaultChecked/>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <Label htmlFor="push-notifications" className="font-semibold flex items-center gap-2">Push Notifications</Label>
                                        <Button asChild variant="outline" size="sm"><Link href="/settings/notifications">Manage</Link></Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <Label htmlFor="auction-alerts" className="font-semibold flex items-center gap-2">Auction/Live Stream Alerts</Label>
                                        <Switch id="auction-alerts" onCheckedChange={(checked) => handleToggle('Auction alerts', checked)} defaultChecked/>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <Label htmlFor="wishlist-notifications" className="font-semibold flex items-center gap-2">Wishlist Notifications</Label>
                                        <Switch id="wishlist-notifications" onCheckedChange={(checked) => handleToggle('Wishlist notifications', checked)} defaultChecked/>
                                    </div>
                                </CardContent>
                            </Card>
                         </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
