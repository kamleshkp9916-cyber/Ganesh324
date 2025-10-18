
export function normalize(text: string | undefined | null): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function unique(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

interface ProductForKeywords {
  name?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  availableSizes?: string;
  availableColors?: string;
  variants?: {
    size?: string;
    color?: string;
  }[];
}

/**
 * Generate keyword tokens from product fields.
 * Keep tokens short and meaningful.
 */
export function generateKeywords(product: ProductForKeywords) {
  const tokens: string[] = [];

  // Title tokens (split words)
  const title = normalize(product.name || '');
  title.split(' ').forEach(t => t.length > 1 && tokens.push(t));

  // Brand
  if (product.brand) tokens.push(normalize(product.brand));

  // Category & Subcategory
  if (product.category) tokens.push(normalize(product.category));
  if (product.subcategory) tokens.push(normalize(product.subcategory));
  
  // Sizes and colors from top-level fields (comma-separated strings)
  if (product.availableSizes) {
    product.availableSizes.split(',').forEach(s => tokens.push(normalize(s)));
  }
  if (product.availableColors) {
    product.availableColors.split(',').forEach(c => tokens.push(normalize(c)));
  }

  // Sizes and colors from variants array
  (product.variants || []).forEach(v => {
    if (v.size) tokens.push(normalize(v.size));
    if (v.color) tokens.push(normalize(v.color));
  });

  // Add some n-grams for title (optional) — e.g. "slim fit" -> 'slim', 'fit', 'slim fit'
  const titleWords = title.split(' ');
  if (titleWords.length > 1) {
    for (let i = 0; i < titleWords.length - 1; i++) {
      const bigram = `${titleWords[i]} ${titleWords[i + 1]}`.trim();
      if (bigram.length) tokens.push(bigram);
    }
  }

  return unique(tokens).slice(0, 100); // cap size
}
