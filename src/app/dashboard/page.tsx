
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { signOut } = useAuthActions();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Or a redirect component
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">StreamCart</h1>
        <div className="flex items-center gap-4">
            <Avatar>
                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button onClick={signOut} variant="outline">Sign Out</Button>
        </div>
      </header>
      <main className="p-8">
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-center">Welcome, {user.displayName}!</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
                <p>You have successfully signed in.</p>
                <p className="mt-2">Your email is: {user.email}</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
