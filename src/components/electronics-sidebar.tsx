
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
        title: "Shop by Category", 
        isDefaultOpen: true,
        links: ["Computers & Laptops", "Smartphones & Accessories", "TV & Home Theater", "Cameras & Drones", "Headphones & Audio", "Video Games"] 
    },
    { title: "Shop by Brand", links: ["Apple", "Samsung", "Sony", "Dell", "HP"] },
];

const specialLinks = [
    { name: "Top Deals", href: "#", isRed: true },
]

export function ElectronicsSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 lg:hidden">Electronics</h2>
            <div className="space-y-2 mb-4">
                {specialLinks.map(link => (
                    <Link key={link.name} href={link.href} className={cn("block text-sm font-medium", link.isRed ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-foreground")}>
                        {link.name}
                    </Link>
                ))}
            </div>

            <Accordion type="multiple" defaultValue={["Shop by Category"]} className="w-full">
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
