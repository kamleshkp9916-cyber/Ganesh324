
"use client"

import Link from "next/link";
import {
  Package2,
  Menu,
  Search,
  CircleUser,
  ShieldCheck,
  RadioTower,
  User,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useAuthActions } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/seller/dashboard", label: "Dashboard", disabled: false },
    { href: "/seller/revenue", label: "Revenue", disabled: false },
    { href: "/seller/orders", label: "Orders", disabled: false },
    { href: "/seller/products", label: "Products", disabled: false },
    { href: "/seller/promotions", label: "Promotions", disabled: false },
    { href: "/seller/messages", label: "Messages", disabled: false },
    { href: "/seller/feed", label: "Feed", disabled: false },
    { href: "#", label: "Sponsored", disabled: true },
];

export function SellerHeader() {
  const { user, userData } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/seller/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">StreamCart Seller</span>
        </Link>
        {navLinks.map((link) => (
            <Link
                key={link.href}
                href={link.disabled ? "#" : link.href}
                className={cn(
                    "transition-colors",
                    link.disabled ? "text-muted-foreground/50 cursor-not-allowed flex items-center gap-2" : 
                    pathname === link.href
                    ? "text-foreground hover:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-disabled={link.disabled}
                onClick={(e) => link.disabled && e.preventDefault()}
            >
                {link.label}
                {link.disabled && <Badge variant="outline">Soon</Badge>}
            </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/seller/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">StreamCart</span>
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.disabled ? "#" : link.href}
                 className={cn(
                    "transition-colors flex items-center gap-2",
                    link.disabled ? "text-muted-foreground/50 cursor-not-allowed" :
                    pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-disabled={link.disabled}
                onClick={(e) => link.disabled && e.preventDefault()}
              >
                {link.label}
                {link.disabled && <Badge variant="outline">Soon</Badge>}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
         <Button asChild>
            <Link href="/seller/live/studio">
                <RadioTower className="mr-2 h-4 w-4" /> Go Live
            </Link>
        </Button>
        {userData?.verificationStatus === 'verified' && (
          <Badge variant="success" className="items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            KYC Verified
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || <User />}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push('/seller/profile')}>
                <User className="mr-2 h-4 w-4" />
                My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/seller/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/seller/messages?executive=true')}>
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut(true)}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
