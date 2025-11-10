
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
        title: "Men's Clothing", 
        isDefaultOpen: true,
        links: [
            "All Men's Clothing", "New Arrivals", "Activewear", "Blazers & Sport Coats", "Coats & Jackets", "Dress Shirts", "Hoodies & Sweatshirts", "Jeans", "Pants", "Polo Shirts", "Shirts", "Shorts", "Suits & Tuxedos", "Sweaters", "Swim Trunks & Board Shorts", "T-Shirts", "Underwear & Socks",
        ] 
    },
    { title: "Shop By Size Range", links: ["Regular", "Big & Tall", "Short"] },
    { title: "Men's Shoes", links: ["Boots", "Sneakers & Athletic", "Sandals & Flip-Flops", "Dress Shoes", "Loafers & Drivers"] },
    { title: "Accessories", links: ["Bags", "Belts", "Hats", "Ties & Pocket Squares", "Wallets", "Sunglasses & Eyewear"] },
    { title: "Grooming & Cologne", links: ["Cologne", "Skincare", "Shaving & Beard Care"] },
    { title: "Men's Brands", links: ["Brand X", "Brand Y", "Brand Z"] },
];

interface MensSidebarProps {
    onSelectSubcategory: (slug: string | null) => void;
    selectedSubcategory: string | null;
}

export function MensSidebar({ onSelectSubcategory, selectedSubcategory }: MensSidebarProps) {
    
    const getSlug = (link: string) => {
        if (link === "All Men's Clothing") return null;
        return link.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Men</h2>
            
            <Accordion type="multiple" defaultValue={["Men's Clothing"]} className="w-full">
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
