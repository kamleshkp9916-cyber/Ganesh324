
"use client";

import { useState } from "react";
import {
    LayoutGrid,
    FileText,
    Flag,
    Ticket,
    Truck,
    MessageSquare,
    Sparkles,
    ChevronRight,
    ArrowLeft,
    Banknote,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/admin-layout";
import { CategoriesSettings } from "@/components/settings/categories-settings";
import { PromotionsSettings } from "@/components/settings/promotions-settings";
import { ShippingSettingsComponent } from "@/components/settings/shipping-settings";
import { PoliciesSettings } from "@/components/settings/policies-settings";
import { ContentModerationSettings } from "@/components/settings/content-moderation-settings";
import { UserNotificationsSettings } from "@/components/settings/user-notifications";

export const PAYOUT_REQUESTS_KEY = 'streamcart_payout_requests';

export type SettingView = 'main' | 'categories' | 'promotions' | 'shipping' | 'policies' | 'moderation' | 'notifications' | 'payouts';

const settingsLinks = [
    { id: 'categories', href: "#", icon: LayoutGrid, title: "Category Management", description: "Add, edit, or delete product categories and subcategories." },
    { id: 'promotions', href: "#", icon: Ticket, title: "Promotions & Coupons", description: "Manage promotional slides and discount codes." },
    { id: 'shipping', href: "#", icon: Truck, title: "Shipping & Delivery", description: "Configure flat-rate delivery charges." },
    { id: 'policies', href: "#", icon: FileText, title: "Content & Policies", description: "Edit your Terms of Service and Privacy Policy." },
    { id: 'moderation', href: "#", icon: Flag, title: "Content Moderation", description: "Review and act on content flagged by users." },
    { id: 'notifications', href: "#", icon: MessageSquare, title: "User Notifications", description: "Send announcements or warnings to users." },
    { id: 'payouts', href: "/admin/users?tab=payouts", icon: Banknote, title: "Payout Settings", description: "Configure seller payout options and fees." },
];

export default function AdminSettingsHubPage() {
  const [activeView, setActiveView] = useState<SettingView>('main');

  const renderContent = () => {
    switch (activeView) {
        case 'categories':
            return <CategoriesSettings />;
        case 'promotions':
            return <PromotionsSettings />;
        case 'shipping':
            return <ShippingSettingsComponent />;
        case 'policies':
            return <PoliciesSettings />;
        case 'moderation':
            return <ContentModerationSettings />;
        case 'notifications':
            return <UserNotificationsSettings />;
        default:
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>
                            Manage your platform's configuration, content, and operational settings from one place.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {settingsLinks.map(link => (
                                <Link key={link.id} href={link.href} onClick={(e) => { if(link.href==="#") { e.preventDefault(); setActiveView(link.id as SettingView) } }}>
                                    <Card className="hover:bg-muted/50 hover:shadow-lg transition-all h-full">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                                                        <link.icon className="h-5 w-5" />
                                                    </div>
                                                    {link.title}
                                                </CardTitle>
                                                <CardDescription className="text-xs pt-1">{link.description}</CardDescription>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            );
    }
  };

  const getTitle = () => {
    if (activeView === 'main') return 'Settings';
    const link = settingsLinks.find(l => l.id === activeView);
    return link ? link.title : 'Settings';
  };

  return (
    <AdminLayout>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:p-8">
            {activeView !== 'main' && (
                <div className="mb-4">
                    <Button variant="ghost" onClick={() => setActiveView('main')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Settings
                    </Button>
                </div>
            )}
            {renderContent()}
        </main>
    </AdminLayout>
  );
}

    