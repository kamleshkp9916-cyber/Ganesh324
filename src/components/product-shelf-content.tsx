
"use client";

import { SheetHeader, SheetTitle } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardFooter } from './ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Sparkles, ShoppingCart, Package, Users, Star, ShoppingBag } from 'lucide-react';

export const ProductShelfContent = ({ sellerProducts, handleAddToCart, handleBuyNow, isMobile, onClose, toast }: { sellerProducts: any[], handleAddToCart: (product: any) => void, handleBuyNow: (product: any) => void, isMobile: boolean, onClose: () => void, toast: any }) => {
    return (
        <>
            {isMobile && (
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Products in this Stream</SheetTitle>
                </SheetHeader>
            )}
             <ScrollArea className={cn("h-full", isMobile && "no-scrollbar")}>
                <div className={cn("p-4", isMobile ? "grid grid-cols-2 sm:grid-cols-3 gap-4" : "flex gap-4")}>
                    {sellerProducts.length > 0 ? (
                        sellerProducts.map((product: any, index: number) => (
                            <Card key={index} className="w-full overflow-hidden h-full flex flex-col flex-shrink-0 first:ml-0.5 last:mr-0.5" style={{width: isMobile ? 'auto': '160px'}}>
                                <Link href={`/product/${product.key}`} className="group block">
                                    <div className="relative aspect-square bg-muted">
                                        <Image
                                            src={product.images[0]?.preview || product.images[0]}
                                            alt={product.name}
                                            fill
                                            sizes="50vw"
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute bottom-2 right-2">
                                            <Button size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white backdrop-blur-sm">
                                                <Sparkles className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Badge variant="destructive">Out of Stock</Badge>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="p-2 flex-grow flex flex-col">
                                    <Link href={`/product/${product.key}`} className="group block">
                                        <h4 className="font-semibold truncate text-xs group-hover:underline">{product.name}</h4>
                                        <p className="font-bold text-sm">{product.price}</p>
                                    </Link>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary"><Package className="h-3 w-3" /> {product.stock} left</div>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary"><Users className="h-3 w-3" /> {product.sold} sold</div>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary"><Star className="h-3 w-3" /> {product.reviews}</div>
                                    </div>
                                </div>
                                <CardFooter className="p-2 grid grid-cols-1 gap-2">
                                    {product.stock > 0 ? (
                                        <>
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => { handleAddToCart(product); onClose(); }}><ShoppingBag className="mr-1 h-3 w-3" /> Cart</Button>
                                            <Button size="sm" className="w-full text-xs h-8" onClick={() => { handleBuyNow(product); onClose(); }}>Buy Now</Button>
                                        </>
                                    ) : (
                                        <Button size="sm" className="w-full text-xs h-8" onClick={() => { toast({ title: "We'll let you know!", description: `You will be notified when ${product.name} is back in stock.`}); onClose(); }}>Notify Me</Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-muted-foreground py-10 w-full">No products to show.</div>
                    )}
                </div>
            </ScrollArea>
        </>
    );
};
