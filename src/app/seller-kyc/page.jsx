import React from "react";
import OdiditVerifier from '@/components/OdiditVerifier';

export default function SellerKYCPage() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Seller KYC Verification</h2>
      <OdiditVerifier onVerified={(res) => console.log("KYC Completed:", res)} />
    </div>
  );
}
