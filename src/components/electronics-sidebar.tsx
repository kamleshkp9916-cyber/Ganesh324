
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

export function ElectronicsSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 lg:hidden">Electronics</h2>
            
            <Accordion type="multiple" defaultValue={["Shop by Category"]} className="w-full">
                {sidebarSections.map(section => (
                    <AccordionItem value={section.title} key={section.title}>
                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-2 pl-2">
                                {section.links.map(link => {
                                     const subCategorySlug = link.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
                                    return (
                                        <Link key={link} href={`/electronics/${subCategorySlug}`} className="text-sm text-muted-foreground hover:text-foreground">
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
