
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";

const subCategories = ["Dresses", "Tops", "Jeans", "Jackets", "Skirts"];
const brands = ["Brand A", "Brand B", "Brand C", "RetroCam"];
const sizes = ["XS", "S", "M", "L", "XL"];
const colors = [
  { name: "Black", value: "bg-black" },
  { name: "White", value: "bg-white" },
  { name: "Blue", value: "bg-blue-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Green", value: "bg-green-500" },
];

export function ProductFilterSidebar() {
  const [priceRange, setPriceRange] = useState([500, 7500]);
  const [selectedRating, setSelectedRating] = useState(0);

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
      <div className="p-4 lg:p-0 lg:pr-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Filters</h3>
            <Button variant="ghost" size="sm">Clear all</Button>
        </div>
        <Accordion type="multiple" defaultValue={["sub-category", "price", "brand", "size", "rating"]} className="w-full">
            
            <AccordionItem value="sub-category">
                <AccordionTrigger>Sub-category</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                        {subCategories.map((sub) => (
                            <div key={sub} className="flex items-center space-x-2">
                                <Checkbox id={`sub-${sub}`} />
                                <Label htmlFor={`sub-${sub}`} className="font-normal">{sub}</Label>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price">
                <AccordionTrigger>Price</AccordionTrigger>
                <AccordionContent>
                    <div className="p-2">
                        <Slider
                            defaultValue={priceRange}
                            max={15000}
                            step={100}
                            onValueChange={setPriceRange}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>₹{priceRange[0]}</span>
                            <span>₹{priceRange[1]}</span>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="brand">
                <AccordionTrigger>Brand</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                        {brands.map((brand) => (
                            <div key={brand} className="flex items-center space-x-2">
                                <Checkbox id={`brand-${brand}`} />
                                <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="size">
                <AccordionTrigger>Size</AccordionTrigger>
                <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                            <Button key={size} variant="outline" size="sm">{size}</Button>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
            
             <AccordionItem value="color">
                <AccordionTrigger>Color</AccordionTrigger>
                <AccordionContent>
                     <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                             <Button key={color.name} variant="outline" size="icon" className="h-8 w-8">
                                <div className={cn("h-5 w-5 rounded-full border", color.value)} />
                             </Button>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>

             <AccordionItem value="rating">
                <AccordionTrigger>Rating</AccordionTrigger>
                <AccordionContent>
                    <div className="flex flex-col items-start gap-2">
                         {[4, 3, 2, 1].map(rating => (
                            <Button key={rating} variant="ghost" className="p-0 h-auto" onClick={() => setSelectedRating(rating)}>
                                <div className={cn("flex items-center gap-2 text-sm p-1 rounded-md", selectedRating === rating && "bg-accent")}>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("w-4 h-4", i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                                        ))}
                                    </div>
                                    <span>& up</span>
                                </div>
                            </Button>
                         ))}
                    </div>
                </AccordionContent>
            </AccordionItem>

             <AccordionItem value="availability">
                <AccordionTrigger>Availability</AccordionTrigger>
                <AccordionContent>
                    <div className="flex items-center space-x-2">
                        <Switch id="in-stock" />
                        <Label htmlFor="in-stock">In Stock Only</Label>
                    </div>
                </AccordionContent>
            </AccordionItem>

             <AccordionItem value="auction">
                <AccordionTrigger>Auction State</AccordionTrigger>
                <AccordionContent>
                    <RadioGroup defaultValue="all">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="auction-all" />
                            <Label htmlFor="auction-all">All Products</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="live" id="auction-live" />
                            <Label htmlFor="auction-live">Live Auctions</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="upcoming" id="auction-upcoming" />
                            <Label htmlFor="auction-upcoming">Upcoming Auctions</Label>
                        </div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>

        </Accordion>
      </div>
    </ScrollArea>
  );
}
