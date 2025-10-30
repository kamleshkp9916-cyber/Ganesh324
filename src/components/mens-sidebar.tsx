
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

export function MensSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Men</h2>
            
            <Accordion type="multiple" defaultValue={["Men's Clothing"]} className="w-full">
                {sidebarSections.map(section => (
                    <AccordionItem value={section.title} key={section.title}>
                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-2 pl-2">
                                {section.links.map(link => {
                                    const subCategorySlug = link.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
                                    return (
                                        <Link key={link} href={`/men/${subCategorySlug}`} className="text-sm text-muted-foreground hover:text-foreground">
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
