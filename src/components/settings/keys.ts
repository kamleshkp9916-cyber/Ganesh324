
export const PROMOTIONAL_SLIDES_KEY = 'streamcart_promotional_slides';
export const COUPONS_KEY = 'streamcart_coupons';
export const CATEGORY_BANNERS_KEY = 'streamcart_category_banners';
export const CATEGORY_HUB_BANNER_KEY = 'streamcart_category_hub_banner';
export const PAYOUT_REQUESTS_KEY = 'streamcart_payout_requests';
export const PLATFORM_FEES_KEY = 'streamcart_platform_fees';
export const ADDITIONAL_CHARGES_KEY = 'streamcart_additional_charges';
export const FOOTER_CONTENT_KEY = 'nipher_footer_content';
export const SECURITY_SETTINGS_KEY = 'nipher_security_settings';


// Type definitions
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

export interface PlatformFees {
  orderCommission: number;
  superChatCommission: number;
}

export interface AdditionalCharge {
  id: number;
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  displayLocation: ('Cart Summary' | 'Payment Page' | 'Order Invoice')[];
}

export interface FooterContent {
  description: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
}

export interface SecuritySettings {
  enforceAdmin2FA: boolean;
  passwordComplexity: {
    length: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
  livekitHost: string;
  livekitApiKey: string;
  livekitApiSecret: string;
  diditApiKey: string;
  deliveryPartner: string;
  deliveryApiKey: string;
  paymentGateway: string;
  pgApiKey: string;
  pgApiSecret: string;
  pgUseCases: string[];
}

    