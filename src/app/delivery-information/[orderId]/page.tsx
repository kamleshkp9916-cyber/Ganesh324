

import { DeliveryInfoClient } from "@/components/delivery-info-client";

export default function DeliveryInformationPage({ params }: { params: { orderId: string } }) {
    return <DeliveryInfoClient orderId={params.orderId} />;
}
