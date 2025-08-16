
"use client";

import Link from 'next/link';
import { Home, Edit, AppWindow, ShoppingCart, Wallet } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/live-selling', icon: Home, label: 'Home' },
  { href: '/create', icon: Edit, label: 'Create' },
  { href: '/dashboard', icon: AppWindow, label: 'Dashboard' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t z-20">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-1 text-muted-foreground w-1/5">
                <item.icon className={cn("h-6 w-6", isActive && "text-primary")} />
                <span className={cn("text-xs", isActive && "text-primary")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
