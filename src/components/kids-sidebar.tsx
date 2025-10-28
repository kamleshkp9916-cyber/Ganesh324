
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

export function KidsSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 lg:hidden">Kids</h2>
            
            <Accordion type="multiple" defaultValue={["Girls' Clothing"]} className="w-full">
                {sidebarSections.map(section => (
                    <AccordionItem value={section.title} key={section.title}>
                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-2 pl-2">
                                {section.links.map(link => {
                                    const subCategorySlug = link.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
                                    return (
                                        <Link key={link} href={`/kids/${subCategorySlug}`} className="text-sm text-muted-foreground hover:text-foreground">
                                            {link}
                                        </Link>
                                    )
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
