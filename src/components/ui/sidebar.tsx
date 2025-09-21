
"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Menu } from "lucide-react"
import { Button } from "./button"

const SidebarContext = React.createContext<{
  open: boolean,
  setOpen: (open: boolean) => void
}>({
    open: false,
    setOpen: () => {},
});

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    const isMobile = useIsMobile();

    const value = React.useMemo(() => ({
        open: isMobile ? open : false,
        setOpen: isMobile ? setOpen : () => {},
    }), [isMobile, open, setOpen]);
    
    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

export const Sidebar = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const isMobile = useIsMobile();
    const { open, setOpen } = useSidebar();

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className={className}>
                     <SheetHeader>
                        <SheetTitle className="sr-only">Sidebar Menu</SheetTitle>
                    </SheetHeader>
                    {children}
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <aside className={className}>
            {children}
        </aside>
    );
};

export const SidebarTrigger = () => {
    const { setOpen } = useSidebar();
    return (
        <Button variant="outline" size="icon" className="shrink-0 md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
        </Button>
    )
}

export const SidebarContent = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
}
export const SidebarHeader = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
}
export const SidebarInset = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
}
