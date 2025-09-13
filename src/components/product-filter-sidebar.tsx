
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
import React, { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { FilterOptions } from "@/lib/filter-data";


interface ProductFilterSidebarProps {
  options: FilterOptions;
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  selectedSubCategories: string[];
  setSelectedSubCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedRating: number;
  setSelectedRating: React.Dispatch<React.SetStateAction<number>>;
  inStockOnly: boolean;
  setInStockOnly: React.Dispatch<React.SetStateAction<boolean>>;
  auctionState: string;
  setAuctionState: React.Dispatch<React.SetStateAction<string>>;
  onClear: () => void;
}

export function ProductFilterSidebar(props: ProductFilterSidebarProps) {
  const {
    options,
    priceRange, setPriceRange,
    selectedBrands, setSelectedBrands,
    selectedRating, setSelectedRating,
    inStockOnly, setInStockOnly,
    auctionState, setAuctionState,
    onClear
  } = props;

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
      <div className="p-4 lg:p-0 lg:pr-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={onClear}>Clear all</Button>
        </div>
        <Accordion type="multiple" defaultValue={["sub-category", "price", "brand", "size", "rating"]} className="w-full">
            
            {options.subCategories && options.subCategories.length > 0 && (
              <AccordionItem value="sub-category">
                  <AccordionTrigger>Sub-category</AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-2">
                          {options.subCategories.map((sub) => (
                              <div key={sub} className="flex items-center space-x-2">
                                  <Checkbox id={`sub-${sub}`} />
                                  <Label htmlFor={`sub-${sub}`} className="font-normal">{sub}</Label>
                              </div>
                          ))}
                      </div>
                  </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="price">
                <AccordionTrigger>Price</AccordionTrigger>
                <AccordionContent>
                    <div className="p-2">
                        <Slider
                            value={priceRange}
                            max={15000}
                            step={100}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>₹{priceRange[0]}</span>
                            <span>₹{priceRange[1]}</span>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            
             {options.brands && options.brands.length > 0 && (
              <AccordionItem value="brand">
                  <AccordionTrigger>Brand</AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-2">
                          {options.brands.map((brand) => (
                              <div key={brand} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`brand-${brand}`} 
                                    checked={selectedBrands.includes(brand)}
                                    onCheckedChange={() => handleBrandChange(brand)}
                                  />
                                  <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
                              </div>
                          ))}
                      </div>
                  </AccordionContent>
              </AccordionItem>
            )}

            {options.sizes && options.sizes.length > 0 && (
              <AccordionItem value="size">
                  <AccordionTrigger>Size</AccordionTrigger>
                  <AccordionContent>
                      <div className="flex flex-wrap gap-2">
                          {options.sizes.map((size) => (
                              <Button key={size} variant="outline" size="sm">{size}</Button>
                          ))}
                      </div>
                  </AccordionContent>
              </AccordionItem>
            )}
            
            {options.colors && options.colors.length > 0 && (
               <AccordionItem value="color">
                  <AccordionTrigger>Color</AccordionTrigger>
                  <AccordionContent>
                       <div className="flex flex-wrap gap-2">
                          {options.colors.map((color) => (
                               <Button key={color.name} variant="outline" size="icon" className="h-8 w-8">
                                  <div className={cn("h-5 w-5 rounded-full border", color.value)} />
                               </Button>
                          ))}
                      </div>
                  </AccordionContent>
              </AccordionItem>
            )}

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
                        <Switch id="in-stock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
                        <Label htmlFor="in-stock">In Stock Only</Label>
                    </div>
                </AccordionContent>
            </AccordionItem>

             <AccordionItem value="auction">
                <AccordionTrigger>Auction State</AccordionTrigger>
                <AccordionContent>
                    <RadioGroup value={auctionState} onValueChange={setAuctionState}>
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
