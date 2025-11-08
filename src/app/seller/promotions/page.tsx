
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SellerHeader } from "@/components/seller/seller-header";
import { BarChart, Flame, PlusCircle, Rocket, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const promotionTiers = [
    {
        name: "Category Spotlight",
        price: "₹1,500/day",
        description: "Feature your product at the top of a specific category page.",
        features: ["Top-of-page placement", "Increased visibility in one category", "Great for targeted exposure"],
        icon: <Sparkles className="h-6 w-6" />,
    },
    {
        name: "Homepage Banner",
        price: "₹5,000/day",
        description: "Get your brand seen by everyone on the main live shopping page.",
        features: ["Premium homepage banner slot", "Maximum brand exposure", "Drives traffic to your profile & streams"],
        icon: <Rocket className="h-6 w-6" />,
    },
    {
        name: "Trending Boost",
        price: "₹2,500/day",
        description: "Boost your product's ranking in the 'Trending' section.",
        features: ["Higher placement on the Trending page", "Ideal for hot, new items", "Capture impulse buyers"],
        icon: <Flame className="h-6 w-6" />,
    },
];

const activePromotions = [
    { productName: "Vintage Camera", type: "Category Spotlight", category: "Electronics", status: "Active", daysLeft: 3 },
    { productName: "Leather Backpack", type: "Trending Boost", status: "Active", daysLeft: 1 },
];


export default function SellerPromotionsPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <SellerHeader />
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 md:p-8">
                <div>
                    <CardHeader className="px-0">
                        <CardTitle>Sponsor Your Products</CardTitle>
                        <CardDescription>
                            Purchase promotional packages to feature your products across the platform and reach more customers.
                        </CardDescription>
                    </CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {promotionTiers.map(tier => (
                            <Card key={tier.name} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-primary/10 p-3 rounded-full">{tier.icon}</div>
                                        <CardTitle className="text-xl">{tier.name}</CardTitle>
                                    </div>
                                    <p className="text-3xl font-bold">{tier.price}</p>
                                    <CardDescription>{tier.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {tier.features.map(feat => (
                                            <li key={feat} className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-primary fill-primary" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create Promotion
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>

                 <Card>
                    <CardHeader>
                        <CardTitle>Active Promotions</CardTitle>
                        <CardDescription>
                            A summary of your currently running product promotions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activePromotions.map((promo, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg mb-4 last:mb-0">
                                <div className="flex items-center gap-4">
                                    <Image src="https://placehold.co/80x80.png" alt={promo.productName} width={64} height={64} className="rounded-md" />
                                    <div>
                                        <p className="font-semibold">{promo.productName}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{promo.type}</span>
                                            {promo.category && (
                                                <>
                                                 <span className="text-muted-foreground/50">|</span>
                                                 <Badge variant="outline">{promo.category}</Badge>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                                    <Badge variant="success">{promo.status}</Badge>
                                    <p className="text-sm font-medium">{promo.daysLeft} day{promo.daysLeft !== 1 && 's'} left</p>
                                    <Button variant="outline" size="sm">Manage</Button>
                                </div>
                            </div>
                        ))}
                         {activePromotions.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">You have no active promotions.</div>
                         )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
