
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";
import { cn } from "@/lib/utils";

const sidebarSections = [
    { 
        title: "Women's Clothing", 
        isDefaultOpen: true,
        links: [
            "All Women's Clothing", "New Arrivals", "Activewear", "Blazers", "Bras, Underwear & Lingerie", "Coats & Jackets", "Dresses", "Hoodies & Sweatshirts", "Jeans", "Loungewear", "Pajamas & Robes", "Pants & Capris", "Shorts", "Skirts", "Suits & Suit Separates", "Sweaters", "Swimsuits & Cover-Ups", "Tights, Socks, & Hosiery", "Tops",
        ] 
    },
    { title: "Shop By Size Range", links: ["Regular", "Plus", "Petite", "Maternity"] },
    { title: "Juniors", links: ["Tops", "Dresses", "Jeans", "Activewear"] },
    { title: "Women's Shoes", links: ["Boots", "Sneakers", "Sandals", "Heels"] },
    { title: "Handbags & Accessories", links: ["Handbags", "Wallets", "Scarves", "Hats"] },
    { title: "Jewelry & Watches", links: ["Fine Jewelry", "Fashion Jewelry", "Watches"] },
    { title: "Beauty", links: ["Skincare", "Makeup", "Fragrance"] },
    { title: "Women's Brands", links: ["Brand A", "Brand B", "Brand C"] },
];

const specialLinks = [
    { name: "Limited-Time Specials", href: "#", isRed: true },
    { name: "30–50% off Underwear & Lingerie", href: "#", isRed: true },
    { name: "Sale & Clearance", href: "#", isRed: true },
]

export function WomensSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 lg:hidden">Women</h2>
            <div className="space-y-2 mb-4">
                {specialLinks.map(link => (
                    <Link key={link.name} href={link.href} className={cn("block text-sm font-medium", link.isRed ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-foreground")}>
                        {link.name}
                    </Link>
                ))}
            </div>

            <Accordion type="multiple" defaultValue={["Women's Clothing"]} className="w-full">
                {sidebarSections.map(section => (
                    <AccordionItem value={section.title} key={section.title}>
                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-2 pl-2">
                                {section.links.map(link => (
                                    <Link key={link} href="#" className="text-sm text-muted-foreground hover:text-foreground">
                                        {link}
                                    </Link>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

