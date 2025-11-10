
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

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

interface WomensSidebarProps {
    onSelectSubcategory: (slug: string | null) => void;
    selectedSubcategory: string | null;
}

export function WomensSidebar({ onSelectSubcategory, selectedSubcategory }: WomensSidebarProps) {
    
    const getSlug = (link: string) => {
        if (link === "All Women's Clothing") return null;
        return link.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Women</h2>
            
            <Accordion type="multiple" defaultValue={["Women's Clothing"]} className="w-full">
                {sidebarSections.map(section => (
                    <AccordionItem value={section.title} key={section.title}>
                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-1 pl-2">
                                {section.links.map(link => {
                                    const slug = getSlug(link);
                                    return (
                                        <Button
                                            key={link}
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start text-sm text-muted-foreground hover:text-foreground h-auto py-1.5 px-2",
                                                selectedSubcategory === slug && "font-semibold text-primary bg-primary/10"
                                            )}
                                            onClick={() => onSelectSubcategory(slug)}
                                        >
                                            {link}
                                        </Button>
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
