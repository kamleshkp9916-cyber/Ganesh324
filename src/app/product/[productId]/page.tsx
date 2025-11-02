
import { ProductDetailClient } from "@/components/product-detail-client";

// The { params: { productId } } destructuring is the correct way
// to access route params in Next.js 15.
export default function ProductDetailPage({ params: { productId } }: { params: { productId: string } }) {
    // Adding the key prop here is crucial. It tells React to create a new
    // instance of the component when the productId changes, resetting its state.
    return <ProductDetailClient key={productId} productId={productId} />;
}
