
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Shield, Bell, HelpCircle, LogOut, Trash2, Loader2, AlertTriangle, MessageSquare, ShieldAlert, KeyRound, Smartphone, Monitor, Globe, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
                            <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
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
    const { user, loading } = useAuth();
    const { signOut } = useAuthActions();
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();
    
    const handleToggle = (setting: string, enabled: boolean) => {
        toast({
            title: "Setting Saved",
            description: `${setting} notifications have been ${enabled ? 'enabled' : 'disabled'}.`
        });
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || loading) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
    }

    if (!user) {
        router.replace('/');
        return null;
    }

    const settingsItems = [
        { icon: <User className="w-5 h-5" />, label: 'Edit Profile', href: '/profile' },
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
                        <TabsList className="mb-6">
                            <TabsTrigger value="account">
                                <User className="mr-2 h-4 w-4" /> Account
                            </TabsTrigger>
                            <TabsTrigger value="appearance">
                                <Palette className="mr-2 h-4 w-4" /> Appearance
                            </TabsTrigger>
                            <TabsTrigger value="security">
                                <Shield className="mr-2 h-4 w-4" /> Security
                            </TabsTrigger>
                            <TabsTrigger value="notifications">
                                <Bell className="mr-2 h-4 w-4" /> Notifications
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="account" className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Information</CardTitle>
                                    <CardDescription>Manage your public profile and personal information.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
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
