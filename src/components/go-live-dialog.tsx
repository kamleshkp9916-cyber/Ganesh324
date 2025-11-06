"use client"

import { useState, useMemo } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Gavel, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const mockProducts = [
    { id: 'prod_1', name: 'Vintage Camera', price: 12500, stock: 15, images: [{ preview: 'https://placehold.co/100x100.png' }] },
    { id: 'prod_2', name: 'Wireless Headphones', price: 4999, stock: 50, images: [{ preview: 'https://placehold.co/100x100.png' }] },
    { id: 'prod_3', name: 'Leather Backpack', price: 6200, stock: 8, images: [{ preview: 'https://placehold.co/100x100.png' }] },
];

export function GoLiveDialog() {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [streamTitle, setStreamTitle] = useState('');
    const [streamDescription, setStreamDescription] = useState('');
    const [isAuction, setIsAuction] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [promotionInterval, setPromotionInterval] = useState(20);

    const sellerProducts = useMemo(() => {
        if (!userData) return [];
        const productsKey = `sellerProducts`;
        const stored = localStorage.getItem(productsKey);
        return stored ? JSON.parse(stored) : mockProducts;
    }, [userData]);

    const handleStartStream = () => {
        if (!selectedProduct || !streamTitle) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a product and enter a stream title.',
            });
            return;
        }

        setIsSubmitting(true);
        const liveStreamData = {
            seller: {
                uid: user?.uid,
                name: userData?.displayName,
                photoURL: userData?.photoURL,
            },
            product: selectedProduct,
            title: streamTitle,
            description: streamDescription,
            isAuction: isAuction,
            startedAt: new Date().toISOString(),
            promotionInterval: promotionInterval,
        };

        // Simulate API call and save to local storage
        setTimeout(() => {
            localStorage.setItem('liveStream', JSON.stringify(liveStreamData));
            window.dispatchEvent(new Event('storage'));
            toast({
                title: "You're Live!",
                description: `Your stream "${streamTitle}" has started.`,
            });
            router.push(`/stream/${user?.uid}`);
            document.getElementById('closeGoLiveDialog')?.click();
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Go Live</DialogTitle>
                <DialogDescription>
                    {step === 1 ? "Select a product to feature in your stream." : "Add final details and start your stream."}
                </DialogDescription>
            </DialogHeader>

            {step === 1 && (
                <div className="py-4 space-y-4">
                    <Label>Your Products</Label>
                    <ScrollArea className="h-64 border rounded-md">
                        <div className="p-4 space-y-2">
                            {sellerProducts.map((product: any) => {
                                const image = product.images?.[0] || product.image;
                                return (
                                <button
                                    key={product.id}
                                    className={`w-full text-left p-2 rounded-md flex items-center gap-3 border ${selectedProduct?.id === product.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    {image && <Image src={image.preview} alt={product.name} width={40} height={40} className="rounded-md" />}
                                    <div>
                                        <p className="font-semibold text-sm">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                                    </div>
                                </button>
                            )})}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {step === 2 && (
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stream-title">Stream Title</Label>
                        <Input
                            id="stream-title"
                            placeholder="e.g., Unboxing New Arrivals!"
                            value={streamTitle}
                            onChange={(e) => setStreamTitle(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="stream-description">Stream Description</Label>
                        <Textarea
                            id="stream-description"
                            placeholder="Tell viewers what your stream is about. You can include links here."
                            value={streamDescription}
                            onChange={(e) => setStreamDescription(e.target.value)}
                            rows={4}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="promotion-interval">Promotion Interval (seconds)</Label>
                        <Input
                            id="promotion-interval"
                            type="number"
                            placeholder="e.g., 20"
                            value={promotionInterval}
                            onChange={(e) => setPromotionInterval(Number(e.target.value))}
                        />
                        <p className="text-xs text-muted-foreground">How often a product is automatically shown in the chat.</p>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                             <Gavel className="text-purple-500" />
                            <Label htmlFor="auction-mode" className="font-semibold">Enable Auction Mode</Label>
                        </div>
                        <Switch
                            id="auction-mode"
                            checked={isAuction}
                            onCheckedChange={setIsAuction}
                        />
                    </div>
                    {isAuction && <p className="text-xs text-muted-foreground">In auction mode, you can start bidding on your selected product at any time during the stream.</p>}
                </div>
            )}

            <DialogFooter>
                {step === 1 ? (
                    <Button onClick={() => setStep(2)} disabled={!selectedProduct}>Next</Button>
                ) : (
                    <>
                        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                        <Button onClick={handleStartStream} disabled={!streamTitle || isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Start Streaming
                        </Button>
                    </>
                )}
                 <DialogClose asChild>
                    <button id="closeGoLiveDialog" className="hidden"></button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}
