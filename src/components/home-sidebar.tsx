
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
        title: "Home Decor", 
        isDefaultOpen: true,
        links: [
            "Candles & Home Fragrance", "Decorative Accessories", "Picture Frames", "Rugs", "Vases",
        ] 
    },
    { title: "Bedding", links: ["Comforters & Quilts", "Duvet Covers", "Sheets & Pillowcases", "Pillows"] },
    { title: "Bath", links: ["Towels", "Shower Curtains", "Bath Rugs & Mats"] },
    { title: "Kitchen", links: ["Cookware", "Bakeware", "Dining & Entertaining", "Small Appliances"] },
    { title: "Furniture", links: ["Living Room", "Bedroom", "Dining Room", "Office"] },
];

const specialLinks = [
    { name: "Home Sale", href: "#", isRed: true },
    { name: "New Arrivals", href: "#", isRed: false },
]

export function HomeSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 lg:hidden">Home</h2>
            <div className="space-y-2 mb-4">
                {specialLinks.map(link => (
                    <Link key={link.name} href={link.href} className={cn("block text-sm font-medium", link.isRed ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-foreground")}>
                        {link.name}
                    </Link>
                ))}
            </div>

            <Accordion type="multiple" defaultValue={["Home Decor"]} className="w-full">
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
