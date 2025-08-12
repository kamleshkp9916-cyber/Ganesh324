
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, LayoutGrid, Menu, Search, ShoppingCart, FilePen, Wallet } from "lucide-react";
import Image from "next/image";

export default function LiveSellingPage() {
  const liveProducts = [
    {
      bgColor: "bg-gradient-to-b from-red-400 to-red-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 1",
    },
    {
      bgColor: "bg-gradient-to-b from-blue-400 to-blue-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 2",
    },
    {
      bgColor: "bg-gradient-to-b from-green-400 to-green-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 3",
    },
    {
      bgColor: "bg-gradient-to-b from-purple-400 to-purple-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 4",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
          </Button>
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Live Selling</h1>
          <Separator className="mt-2" />
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4">
          {liveProducts.map((product, index) => (
            <Card key={index} className="overflow-hidden relative aspect-[9/16]">
              <div className={`absolute inset-0 ${product.bgColor}`} />
              <CardContent className="p-2 flex items-end h-full">
                <div className="flex items-center gap-2 text-white text-sm font-semibold">
                  <Avatar className="border-2 border-red-500">
                    <AvatarImage src={product.userImage} alt={product.userName} data-ai-hint="profile picture" />
                    <AvatarFallback>{product.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>Live Selling New<br/>Arived product</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <footer className="sticky bottom-0 bg-background border-t p-2">
        <div className="flex justify-around">
          <Button variant="ghost" className="flex flex-col h-auto p-1 text-red-500">
            <Home className="h-6 w-6" />
            <span className="text-xs font-bold -mt-1">_</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto p-1 text-muted-foreground">
            <FilePen className="h-6 w-6" />
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto p-1 text-muted-foreground">
            <LayoutGrid className="h-6 w-6" />
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto p-1 text-muted-foreground">
            <ShoppingCart className="h-6 w-6" />
          </Button>
           <Button variant="ghost" className="flex flex-col h-auto p-1 text-muted-foreground">
            <Wallet className="h-6 w-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
