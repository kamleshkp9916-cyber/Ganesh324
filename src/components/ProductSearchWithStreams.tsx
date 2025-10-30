"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getFirestore, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { useDebounce } from '@/hooks/use-debounce';
import { normalize, unique, generateKeywords } from '@/lib/generateKeywords';
import { Input } from './ui/input';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { Loader2, Search, Video, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { productDetails, mockStreams } from '@/lib/product-data';
import { Separator } from './ui/separator';

export function ProductSearchWithStreams() {
  const [q, setQ] = useState('');
  const debouncedQuery = useDebounce(q, 350);
  const [loading, setLoading] = useState(false);
  
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [streamHints, setStreamHints] = useState<any[]>([]);
  
  const [popoverOpen, setPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const tokenize = (text: string): string[] => {
    if (!text || !text.trim()) return [];
    const normalizedText = normalize(text);
    const parts = normalizedText.split(/\s+/).filter(Boolean);
    return unique(parts).slice(0, 10);
  };
  
  const runSearch = useCallback(async (queryText: string) => {
    if (!queryText || !queryText.trim()) {
      setProductSuggestions([]);
      setStreamHints([]);
      setLoading(false);
      setPopoverOpen(false);
      return;
    }
    setLoading(true);
    const tokens = tokenize(queryText);

    try {
      // This is a simplified search for demo purposes on local data
      const allProducts = Object.values(productDetails).map(p => ({...p, keywords: generateKeywords(p)}));

      const scoredProducts = allProducts.map(doc => {
        const k = (doc.keywords || []).map(x => String(x).toLowerCase());
        const score = tokens.reduce((s, t) => s + (k.includes(t) ? 1 : 0), 0);
        return { doc, score };
      }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
      const sortedProducts = scoredProducts.map(x => x.doc);
      
      const scoredStreams = mockStreams.map(st => {
        const keywords = generateKeywords({name: st.title, category: st.category, subcategory: st.subcategory});
        const score = tokens.reduce((s, t) => s + (keywords.includes(t) ? 1 : 0), 0);
        return { st, score };
      }).filter(item => item.score > 0).sort((a, b) => {
        const aLive = a.st.status === 'live' ? 1 : 0;
        const bLive = b.st.status === 'live' ? 1 : 0;
        if (aLive !== bLive) return bLive - aLive;
        return b.score - a.score;
      });
      const sortedStreams = scoredStreams.map(x => x.st);
      
      setProductSuggestions(sortedProducts);
      setStreamHints(sortedStreams);
      
      setPopoverOpen(sortedProducts.length > 0 || sortedStreams.length > 0);

    } catch (e) {
      console.error('Search error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  const hasResults = productSuggestions.length > 0 || streamHints.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/listed-products?search=${encodeURIComponent(q)}`);
    setPopoverOpen(false);
  }

  return (
    <div className="w-full">
      <Popover open={popoverOpen && q.length > 0} onOpenChange={setPopoverOpen}>
        <PopoverAnchor asChild>
            <form className="relative" onSubmit={handleSearchSubmit}>
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search products, brands, and streams..."
                    aria-label="Search products and streams"
                    className="w-full h-12 text-base rounded-full shadow-lg pl-12 pr-12"
                />
                {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
            </form>
        </PopoverAnchor>
        <PopoverContent className="w-[--radix-popover-trigger-width] mt-2 max-h-[70vh] overflow-y-auto p-4" onOpenAutoFocus={(e) => e.preventDefault()}>
            {hasResults ? (
                <div className="space-y-4">
                     {streamHints.length > 0 && (
                        <div>
                            <Link href={`/live-selling?search=${encodeURIComponent(q)}`} className="group flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-secondary">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-md">
                                        <Video className="w-5 h-5 text-primary"/>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Streams for "{q}"</h3>
                                        <p className="text-sm text-muted-foreground">Explore live streams related to your search.</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    )}
                    {(streamHints.length > 0 && productSuggestions.length > 0) && <Separator />}
                    {productSuggestions.length > 0 && (
                        <div>
                            <Link href={`/listed-products?search=${encodeURIComponent(q)}`} className="group flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-secondary">
                                 <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-md">
                                        <ShoppingBag className="w-5 h-5 text-primary"/>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Products for "{q}"</h3>
                                        <p className="text-sm text-muted-foreground">Browse all products matching your search.</p>
                                    </div>
                                </div>
                                 <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>
            ) : !loading && (
                <div className="text-center py-8 text-muted-foreground">No results found for "{q}"</div>
            )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
