
export const PROMOTIONAL_SLIDES_KEY = 'streamcart_promotional_slides';
export const COUPONS_KEY = 'streamcart_coupons';
export const CATEGORY_BANNERS_KEY = 'streamcart_category_banners';
export const CATEGORY_HUB_BANNER_KEY = 'streamcart_category_hub_banner';
export const PAYOUT_REQUESTS_KEY = 'streamcart_payout_requests';

// Type definitions that were in promotions-settings.tsx
export interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  expiresAt?: Date;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  expiresAt?: Date;
  minOrderValue?: number;
  applicableCategories?: string[];
  status: 'active' | 'archived';
}

export interface Banner {
  title: string;
  description: string;
  imageUrl: string;
}

export interface CategoryBanners {
  [categoryName: string]: {
    banner1: Banner;
    banner2: Banner;
  };
}

export interface HubBanner {
  title: string;
  description: string;
  imageUrl: string;
}
