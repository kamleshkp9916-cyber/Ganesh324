
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Term & Conditions</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8 text-sm text-muted-foreground">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-foreground">Terms and Conditions for StreamCart</h2>
                <p>Effective Date: [26/08/2025]</p>
                <p>Last Updated: [26/08/2025]</p>
            </div>

            <p>These Terms and Conditions (“Terms”) govern your access to and use of the StreamCart mobile application, website, and related services (collectively, the “Platform”). By registering an account or otherwise using the Platform, you agree to be bound by these Terms. If you do not agree, you must not use StreamCart.</p>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">1. Eligibility</h3>
                <p>Users must be at least 18 years of age, or the age of majority in their jurisdiction, in order to buy, sell, or participate in auctions through the Platform. By creating an account, you represent and warrant that you meet these eligibility requirements and that all information you provide is accurate and truthful.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">2. Account Registration and Security</h3>
                <p>Users are required to create an account using a valid email address, phone number, or other approved method. You are solely responsible for maintaining the confidentiality of your login credentials and for all activity conducted under your account. StreamCart shall not be liable for any loss or damage resulting from unauthorized access to your account that occurs due to your failure to safeguard your credentials.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">3. Use of the Platform</h3>
                <p>The Platform is intended solely for the lawful buying, selling, live streaming, and auctioning of goods. You agree not to use StreamCart for fraudulent purposes, including but not limited to: selling counterfeit items, engaging in auction manipulation, using bots, or misleading buyers with false information. Any violation of this provision may result in immediate suspension or termination of your account.</p>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">4. Seller Responsibilities</h3>
                <p>Sellers are required to ensure that all products listed or demonstrated via live stream are accurately described, legally permissible, and delivered to buyers in a timely manner. Sellers must not list products that are prohibited by law or by StreamCart’s internal policies (including counterfeit goods, illegal substances, weapons, or items violating intellectual property rights). Sellers who fail to fulfill confirmed sales or auction obligations may be subject to penalties, including refunds, account suspension, or permanent termination.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">5. Buyer Responsibilities</h3>
                <p>Buyers are required to carefully review product details, auction rules, and seller policies before placing an order or submitting a bid. By placing a bid in an auction, you enter into a legally binding agreement to purchase the product if you are declared the winning bidder. Failure to complete payment may result in suspension or permanent restriction from the Platform.</p>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">6. Auctions</h3>
                <p>All auctions conducted through the Platform are binding. Once an auction concludes, the highest bidder is deemed the winner and must complete the purchase transaction within the time period designated. Sellers are obligated to honor the final bid and deliver the product in accordance with the auction terms. StreamCart prohibits auction manipulation, including fake bidding, coordinated price inflation, or any other conduct intended to undermine fair competition.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">7. Payments and Fees</h3>
                <p>All transactions on the Platform must be completed through StreamCart’s approved payment gateways. StreamCart reserves the right to deduct transaction fees, service charges, or commissions from sales proceeds in accordance with its current fee schedule, which may be updated from time to time. Users are responsible for any applicable taxes arising from transactions conducted through the Platform.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">8. Live Streaming</h3>
                <p>StreamCart provides sellers with live streaming functionality for the purpose of showcasing and selling products. Sellers agree not to use live streams to broadcast prohibited content, including explicit material, hate speech, harassment, or illegal activities. StreamCart may terminate live streams or suspend accounts that violate these rules.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">9. Prohibited Content and Conduct</h3>
                <p>You may not upload, post, or distribute any content that is unlawful, misleading, defamatory, obscene, or otherwise harmful. In addition, you may not use the Platform for spamming, phishing, or distributing malware. StreamCart reserves the right to remove any content or account that violates these Terms.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">10. Intellectual Property</h3>
                <p>All rights, title, and interest in the Platform, including logos, designs, software, and proprietary features, are owned by StreamCart or its licensors. Users retain ownership of their uploaded content but grant StreamCart a limited, worldwide, non-exclusive license to use, display, and distribute such content solely for the purposes of operating the Platform.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">11. Dispute Resolution and Refunds</h3>
                <p>Users are encouraged to first attempt to resolve disputes directly. If a resolution cannot be reached, users may file a dispute with StreamCart. StreamCart will investigate the dispute and may issue a refund, credit, or other resolution at its sole discretion. Refund requests for non-delivery, damaged goods, or items not as described must be submitted within 7 days of the estimated delivery date.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">12. Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, StreamCart shall not be liable for any indirect, incidental, or consequential damages, including lost profits, lost opportunities, or reputational harm, arising from your use of the Platform. StreamCart’s total liability to any user shall not exceed the greater of (i) the amount paid by the user in the disputed transaction, or (ii) one hundred U.S. dollars (USD 100).</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">13. Termination</h3>
                <p>StreamCart reserves the right to suspend or terminate any user account, without notice, if the user violates these Terms, engages in fraudulent activity, or otherwise threatens the integrity of the Platform. Upon termination, the user’s rights to access the Platform shall immediately cease.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">14. Governing Law</h3>
                <p>These Terms shall be governed by and construed in accordance with the laws of [Insert Applicable Jurisdiction], without regard to its conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in [Insert Jurisdiction].</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">15. Changes to the Terms</h3>
                <p>StreamCart may modify or update these Terms at any time. Users will be notified of significant changes through email or in-app notifications. Continued use of the Platform after the effective date of such changes constitutes acceptance of the revised Terms.</p>
            </div>
        </div>
      </main>
    </div>
  );
}
