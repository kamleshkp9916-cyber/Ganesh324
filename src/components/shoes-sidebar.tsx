
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
        title: "Women's Shoes", 
        isDefaultOpen: true,
        links: ["Boots", "Sneakers", "Sandals", "Heels", "Flats"] 
    },
    { title: "Men's Shoes", links: ["Boots", "Sneakers & Athletic", "Sandals & Flip-Flops", "Dress Shoes", "Loafers & Drivers"] },
    { title: "Kids' Shoes", links: ["Girls' Shoes", "Boys' Shoes"] },
];

const specialLinks = [
    { name: "Shoe Sale", href: "#", isRed: true },
]

export function ShoesSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 lg:hidden">Shoes</h2>
            <div className="space-y-2 mb-4">
                {specialLinks.map(link => (
                    <Link key={link.name} href={link.href} className={cn("block text-sm font-medium", link.isRed ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-foreground")}>
                        {link.name}
                    </Link>
                ))}
            </div>

            <Accordion type="multiple" defaultValue={["Women's Shoes"]} className="w-full">
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
