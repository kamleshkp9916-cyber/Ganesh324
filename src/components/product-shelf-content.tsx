
"use client";

import { SheetHeader, SheetTitle } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardFooter } from './ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Sparkles, ShoppingCart, Package, Users, Star, ShoppingBag, Heart } from 'lucide-react';
import { productDetails, productToSellerMapping } from '@/lib/product-data';

export const ProductShelfContent = ({ sellerProducts, handleAddToCart, handleBuyNow, isMobile, onClose, toast }: { sellerProducts: any[], handleAddToCart: (product: any) => void, handleBuyNow: (product: any) => void, isMobile: boolean, onClose: () => void, toast: any }) => {
    return (
        <>
            {isMobile && (
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Products in this Stream</SheetTitle>
                </SheetHeader>
            )}
             <ScrollArea className={cn("h-full", isMobile && "no-scrollbar")}>
                <div className={cn("p-4", isMobile ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex gap-4")}>
                    {sellerProducts.length > 0 ? (
                        sellerProducts.map((product: any, index: number) => {
                            const details = productDetails[product.key as keyof typeof productDetails];
                            if (!details) return null;

                            const originalPrice = parseFloat(details.price.replace(/[^0-9.-]+/g, ""));
                            const hasDiscount = details.discountPercentage && details.discountPercentage > 0;
                            const discountedPrice = hasDiscount ? originalPrice * (1 - details.discountPercentage / 100) : originalPrice;

                            return (
                            <Card key={index} className={cn("w-full overflow-hidden h-full flex flex-col flex-shrink-0 first:ml-0.5 last:mr-0.5", !isMobile && "w-40")}>
                                <Link href={`/product/${product.key}`} className="group block">
                                    <div className="relative aspect-square bg-muted">
                                        <Image
                                            src={product.images[0]?.preview || product.images[0]}
                                            alt={product.name}
                                            fill
                                            sizes="50vw"
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-8 w-8 rounded-full bg-black/30 text-white backdrop-blur-sm z-10 hover:bg-black/50 hover:text-red-500">
                                            <Heart className="h-4 w-4" />
                                        </Button>
                                        <div className="absolute bottom-2 right-2">
                                            <Button size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white backdrop-blur-sm">
                                                <Sparkles className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {details.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Badge variant="destructive">Out of Stock</Badge>
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                            <Star className="w-3 h-3 text-black fill-black" />
                                            <span className="font-bold">4.8</span>
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-2 flex-grow flex flex-col">
                                    <Link href={`/product/${product.key}`} className="group block">
                                        <h4 className="font-semibold truncate text-xs group-hover:underline">{product.name}</h4>
                                        <div className="flex items-baseline gap-x-2 mt-1">
                                            <p className="font-bold text-sm text-foreground">
                                                ₹{discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                            {hasDiscount && (
                                                <>
                                                    <p className="text-xs text-muted-foreground line-through">
                                                        ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                    <Badge variant="destructive" className="text-[10px] px-1 py-0">({details.discountPercentage}% OFF)</Badge>
                                                </>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary"><Package className="h-3 w-3" /> {details.stock} left</div>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary"><Users className="h-3 w-3" /> {details.sold} sold</div>
                                    </div>
                                </div>
                                <CardFooter className="p-2 grid grid-cols-1 gap-2">
                                    {details.stock > 0 ? (
                                        <>
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => { handleAddToCart(product); onClose(); }}><ShoppingBag className="mr-1 h-3 w-3" /> Cart</Button>
                                            <Button size="sm" className="w-full text-xs h-8" onClick={() => { handleBuyNow(product); onClose(); }}>Buy Now</Button>
                                        </>
                                    ) : (
                                        <Button size="sm" className="w-full text-xs h-8" onClick={() => { toast({ title: "We'll let you know!", description: `You will be notified when ${product.name} is back in stock.`}); onClose(); }}>Notify Me</Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )})
                    ) : (
                        <div className="col-span-full text-center text-muted-foreground py-10 w-full">No products to show.</div>
                    )}
                </div>
            </ScrollArea>
        </>
    );
};
