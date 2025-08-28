
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Grid3x3, ShoppingCart, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';

const navItems = [
    { href: '/live-selling', icon: Home, label: 'Home' },
    { href: '/orders', icon: ClipboardList, label: 'Orders' },
    { href: '/top-seller', icon: Grid3x3, label: 'Sellers' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart' },
    { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t shadow-md md:hidden z-40">
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link href={item.href} key={item.label}>
                            <div className={cn(
                                "inline-flex flex-col items-center justify-center px-5 h-full hover:bg-muted group w-full",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                <item.icon className="w-5 h-5 mb-1" />
                                <span className="text-xs">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
