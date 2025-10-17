
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { productDetails } from '@/lib/product-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';

export default function ProductSpecificationsPage() {
    const router = useRouter();
    const params = useParams();
    const { productId } = params;

    const product = productDetails[productId as keyof typeof productDetails];

    if (!product) {
        return (
             <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const productSpecificDetails = [
        { label: 'Brand', value: product.brand },
        { label: 'Category', value: product.category },
        { label: 'Sub-category', value: product.subcategory },
        { label: 'Model Number', value: (product as any).modelNumber },
        { label: 'Default Color', value: (product as any).color },
        { label: 'Default Size', value: (product as any).size },
        { label: 'Country of Origin', value: (product as any).origin },
    ].filter(detail => detail.value);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate">Product Details</h1>
                <div className="w-10"></div>
            </header>
            <main className="container mx-auto py-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">General Information</h3>
                                <Table>
                                    <TableBody>
                                        {productSpecificDetails.map(detail => (
                                            <TableRow key={detail.label}>
                                                <TableHead className="w-1/3">{detail.label}</TableHead>
                                                <TableCell>{detail.value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {product.highlights && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        {product.highlights.split('\\n').filter(h => h.trim() !== '').map((highlight: string, index: number) => (
                                            <li key={index}>{highlight}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                             {product.variants && product.variants.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Available Variants</h3>
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Color</TableHead>
                                                <TableHead>Size</TableHead>
                                                <TableHead className="text-right">Stock</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(product.variants as any[]).map((variant, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{variant.color || '-'}</TableCell>
                                                    <TableCell>{variant.size || '-'}</TableCell>
                                                    <TableCell className="text-right">{variant.stock}</TableCell>
                                                    <TableCell className="text-right">{variant.price ? `₹${variant.price.toFixed(2)}` : 'Default'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
