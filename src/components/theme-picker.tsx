
"use client"

import { useTheme } from "next-themes"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "./ui/card"

const themes = [
    { name: "dark", label: "Dark" },
    { name: "system", label: "System Default" },
    { name: "light", label: "Light" },
]

const ThemeCard = ({ theme, isSelected, setTheme }: { theme: { name: string, label: string }, isSelected: boolean, setTheme: (theme: string) => void }) => {
    return (
        <button
            onClick={() => setTheme(theme.name)}
            className={cn(
                "w-full p-4 rounded-lg border-2 text-center relative",
                isSelected ? "border-primary" : "border-border hover:border-primary/50"
            )}
        >
            {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-4 w-4" />
                </div>
            )}
            <Card className={cn("overflow-hidden", theme.name === 'system' && 'flex')}>
                <div className={cn("h-20 w-full", theme.name === 'dark' && 'bg-gray-800', theme.name === 'system' && 'w-1/2 bg-gray-800', theme.name === 'light' && 'bg-gray-200')}></div>
                {theme.name === 'system' && <div className="h-20 w-1/2 bg-gray-200" />}
            </Card>
            <p className="mt-2 font-semibold text-sm">{theme.label}</p>
        </button>
    )
}

export function ThemePicker() {
    const { theme: activeTheme, setTheme } = useTheme()

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Theme</h3>
            <p className="text-sm text-muted-foreground mb-4">Select your default theme.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {themes.map(theme => (
                    <ThemeCard
                        key={theme.name}
                        theme={theme}
                        isSelected={activeTheme === theme.name}
                        setTheme={setTheme}
                    />
                ))}
            </div>
        </div>
    )
}
