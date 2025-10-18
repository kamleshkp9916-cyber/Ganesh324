
"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { useDebounce } from '@/hooks/use-debounce';
import { normalize, unique } from '@/lib/generateKeywords';
import { Input } from './ui/input';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    keywords: string[];
    [key: string]: any;
}

interface ProductSearchProps {
    onSearchComplete: (results: Product[], query: string) => void;
    initialProducts?: Product[];
}


export default function ProductSearch({ onSearchComplete, initialProducts = [] }: ProductSearchProps) {
  const db = getFirestoreDb();
  const [q, setQ] = useState('');
  const debouncedQuery = useDebounce(q, 350);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tokenize = (text: string): string[] => {
    if (!text || !text.trim()) return [];
    const normalizedText = normalize(text);
    const parts = normalizedText.split(/\s+/).filter(Boolean);
    return unique(parts).slice(0, 10);
  };
  
  const runSearch = useCallback(async (queryText: string, fullSearch = false) => {
    if (!queryText || !queryText.trim()) {
      setSuggestions([]);
      setLoading(false);
      setPopoverOpen(false);
      // When the query is cleared, also clear the parent component's results.
      if (fullSearch) {
          onSearchComplete([], '');
      }
      return;
    }
    setLoading(true);
    const tokens = tokenize(queryText);

    try {
      // For demo, we are filtering local mock data
      const allProducts = initialProducts;

      // Score and sort products
      const scored = allProducts.map(doc => {
        const k = (doc.keywords || []).map(x => String(x).toLowerCase());
        const score = tokens.reduce((s, t) => s + (k.includes(t) ? 1 : 0), 0);
        return { doc, score };
      }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

      const sorted = scored.map(x => x.doc);

      if (fullSearch) {
        onSearchComplete(sorted, queryText);
        setSuggestions([]);
        setPopoverOpen(false);
        inputRef.current?.blur();
      } else {
        setSuggestions(sorted.slice(0, 6));
        setPopoverOpen(sorted.length > 0);
      }
    } catch (e) {
      console.error('Search error', e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [initialProducts, onSearchComplete]);

  useEffect(() => {
    if (debouncedQuery) {
        runSearch(debouncedQuery);
    } else {
        setSuggestions([]);
        setPopoverOpen(false);
        // If the debounced query is empty, it means the user cleared the input.
        // We trigger a full search with an empty query to clear the results in the parent.
        runSearch('', true);
    }
  }, [debouncedQuery, runSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      runSearch(q, true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQ(newQuery);
    if (!newQuery.trim()) {
      setPopoverOpen(false);
      onSearchComplete([], ''); // Immediately clear results on empty input
    }
  }


  return (
    <div className="relative w-full">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverAnchor asChild>
          <form className="relative w-full" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              value={q}
              onChange={handleInputChange}
              placeholder="Search products, sizes or colors..."
              aria-label="Search products"
              className="w-full pl-10 pr-10 rounded-full"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
          </form>
        </PopoverAnchor>
        {suggestions.length > 0 && (
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
              {suggestions.map(suggestion => (
                  <Link 
                      key={suggestion.id} 
                      href={`/product/${suggestion.key || suggestion.id}`} 
                      className="block p-2 hover:bg-accent cursor-pointer text-sm"
                      onClick={() => {
                          setQ('');
                          setSuggestions([]);
                          setPopoverOpen(false);
                      }}
                  >
                      {suggestion.name}
                  </Link>
              ))}
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
