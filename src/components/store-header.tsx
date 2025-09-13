

"use client";

import Link from "next/link";

const navLinks = [
    { name: "Women", href: "/listed-products" },
    { name: "Men", href: "/mens-clothing" },
    { name: "Kids", href: "/kids" },
    { name: "Home", href: "/home" },
    { name: "Electronics", href: "/electronics" },
    { name: "Shoes", href: "/shoes" },
    { name: "Handbags", href: "/handbags" },
    { name: "Trending", href: "/trending" },
    { name: "Sale", href: "/sale", isSale: true },
];

export function StoreHeader() {
    return (
        <header className="hidden lg:block bg-background text-foreground sticky top-16 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center">
                    {navLinks.map(link => (
                        <Link 
                            key={link.name} 
                            href={link.href} 
                            className={`px-4 py-3 text-sm font-medium transition-colors hover:text-primary ${link.isSale ? 'text-red-600' : ''}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}
