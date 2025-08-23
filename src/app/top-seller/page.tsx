
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Star, Users } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const topSellers = [
    { id: 'GadgetGuru', name: 'GadgetGuru', avatar: 'https://placehold.co/80x80.png', followers: '25.5k', rating: 4.9, bio: 'Your source for the latest and greatest in tech.' },
    { id: 'FashionFinds', name: 'FashionFinds', avatar: 'https://placehold.co/80x80.png', followers: '18.2k', rating: 4.8, bio: 'Curating the most stylish vintage and modern fashion.' },
    { id: 'BeautyBox', name: 'BeautyBox', avatar: 'https://placehold.co/80x80.png', followers: '31.1k', rating: 4.9, bio: 'All things makeup, skincare, and beauty tutorials.' },
    { id: 'HomeHaven', name: 'HomeHaven', avatar: 'https://placehold.co/80x80.png', followers: '12.8k', rating: 4.7, bio: 'Making your home a sanctuary with beautiful decor.' },
    { id: 'GamerGuild', name: 'GamerGuild', avatar: 'https://placehold.co/80x80.png', followers: '42.3k', rating: 4.9, bio: 'Pro tips, reviews, and the best gaming gear.' },
    { id: 'ArtisanAlley', name: 'ArtisanAlley', avatar: 'https://placehold.co/80x80.png', followers: '8.6k', rating: 5.0, bio: 'Handcrafted goods made with love and passion.' },
];

export default function TopSellerPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Top Sellers</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <Award className="h-12 w-12 mx-auto text-primary mb-2" />
                <h2 className="text-3xl font-extrabold tracking-tight">Meet Our Best Sellers</h2>
                <p className="text-muted-foreground mt-2">Discover the most popular and trusted sellers on StreamCart.</p>
            </div>

            <div className="grid gap-6">
                {topSellers.map((seller) => (
                    <Card key={seller.id}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={seller.avatar} alt={seller.name} />
                                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <Link href={`/profile?userId=${seller.id}`} className="hover:underline">
                                    <h3 className="text-lg font-bold">{seller.name}</h3>
                                </Link>
                                <p className="text-sm text-muted-foreground mt-1">{seller.bio}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{seller.followers}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        <span>{seller.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <Button asChild variant="outline">
                                <Link href={`/profile?userId=${seller.id}`}>View Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
