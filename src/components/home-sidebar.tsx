
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

export function HomeSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 lg:hidden">Home</h2>

            <Accordion type="multiple" defaultValue={["Home Decor"]} className="w-full">
                {sidebarSections.map(section => (
                    <AccordionItem value={section.title} key={section.title}>
                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-2 pl-2">
                                {section.links.map(link => {
                                    const subCategorySlug = link.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
                                    return (
                                        <Link key={link} href={`/home/${subCategorySlug}`} className="text-sm text-muted-foreground hover:text-foreground">
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
