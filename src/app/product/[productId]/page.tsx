

import { ProductDetailClient } from "@/components/product-detail-client";

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
    // Adding the key prop here is crucial. It tells React to create a new
    // instance of the component when the productId changes, resetting its state.
    return <ProductDetailClient key={params.productId} productId={params.productId} />;
}
