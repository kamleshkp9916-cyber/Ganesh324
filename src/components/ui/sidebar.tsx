
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
    
    const value = React.useMemo(() => ({
        open,
        setOpen,
    }), [open, setOpen]);
    
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

export const SidebarTrigger = () => {
    const { setOpen } = useSidebar();
    return (
        <Button variant="outline" size="icon" className="shrink-0 md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
        </Button>
    )
}

// These are no longer needed as wrappers but are kept for compatibility
export const Sidebar = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SidebarContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SidebarHeader = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SidebarInset = ({ children }: { children: React.ReactNode }) => <>{children}</>
