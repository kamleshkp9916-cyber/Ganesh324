
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
        title: "Girls' Clothing", 
        isDefaultOpen: true,
        links: [
            "Dresses", "Tops & T-Shirts", "Jeans & Leggings", "Pajamas", "Swimsuits",
        ] 
    },
    { title: "Boys' Clothing", links: ["Shirts", "Pants & Shorts", "Hoodies", "Pajamas", "Swim Trunks"] },
    { title: "Baby Clothing", links: ["Bodysuits", "Sleepers", "Gift Sets"] },
    { title: "Kids' Shoes", links: ["Sneakers", "Sandals", "Boots"] },
    { title: "Toys & Games", links: ["Action Figures", "Dolls", "Board Games", "LEGO"] },
];

const specialLinks = [
    { name: "Back to School", href: "#", isRed: true },
    { name: "Character Shop", href: "#", isRed: false },
    { name: "Sale & Clearance", href: "#", isRed: true },
]

export function KidsSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 lg:hidden">Kids</h2>
            <div className="space-y-2 mb-4">
                {specialLinks.map(link => (
                    <Link key={link.name} href={link.href} className={cn("block text-sm font-medium", link.isRed ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-foreground")}>
                        {link.name}
                    </Link>
                ))}
            </div>

            <Accordion type="multiple" defaultValue={["Girls' Clothing"]} className="w-full">
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
