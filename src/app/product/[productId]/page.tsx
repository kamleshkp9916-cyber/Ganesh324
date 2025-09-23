

import { ProductDetailClient } from "@/components/product-detail-client";

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
    return <ProductDetailClient productId={params.productId} />;
}


    