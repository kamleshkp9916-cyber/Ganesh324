
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Shield, Bell, HelpCircle, LogOut, Trash2, Loader2, AlertTriangle, MessageSquare, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthActions } from '@/lib/auth';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import Link from 'next/link';


const surveyReasons = [
    "I'm not using StreamCart anymore",
    "I'm switching to a different platform",
    "I have privacy concerns",
    "I receive too many notifications",
    "I had a bad experience",
    "Other"
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
        { icon: <Shield className="w-5 h-5" />, label: 'Privacy & Security', href: '/privacy-and-security' },
        { icon: <Bell className="w-5 h-5" />, label: 'Notifications', href: '/settings/notifications' },
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
                <div className="max-w-2xl mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>Manage your profile, privacy, and notification settings.</CardDescription>
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
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h4 className="font-semibold">Log Out</h4>
                                    <p className="text-xs text-muted-foreground">End your current session on this device.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => signOut()}>
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
