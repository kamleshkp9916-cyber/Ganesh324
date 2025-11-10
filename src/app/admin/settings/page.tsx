
"use client"

import {
  LayoutGrid,
  FileText,
  Flag,
  Ticket,
  Truck,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout"

const settingsLinks = [
    { href: "/admin/settings/categories", icon: LayoutGrid, title: "Category Management", description: "Add, edit, or delete product categories and subcategories." },
    { href: "/admin/settings/promotions", icon: Ticket, title: "Promotions & Coupons", description: "Manage promotional slides and discount codes." },
    { href_disabled: "/admin/settings/site-content", icon: Sparkles, title: "Site Content & Banners", description: "Update homepage banners and featured content." },
    { href_disabled: "/admin/settings/notifications", icon: MessageSquare, title: "User Notifications", description: "Send announcements or warnings to users." },
    { href: "/admin/settings/policies", icon: FileText, title: "Content & Policies", description: "Edit your Terms of Service and Privacy Policy." },
    { href: "/admin/settings/shipping", icon: Truck, title: "Shipping & Delivery", description: "Configure flat-rate delivery charges." },
    { href_disabled: "/admin/settings/content-moderation", icon: Flag, title: "Content Moderation", description: "Review and act on content flagged by users." },
];

export default function AdminSettingsHubPage() {
  const router = useRouter();

  return (
    <AdminLayout>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:p-8">
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
                            <Link key={link.title} href={link.href || "#"} className={!link.href ? "pointer-events-none" : ""}>
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
        </main>
    </AdminLayout>
  )
}
