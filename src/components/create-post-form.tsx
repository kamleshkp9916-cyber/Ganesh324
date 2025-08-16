
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Video } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/hooks/use-auth.tsx";

export function CreatePostForm() {
    const { user } = useAuth();
  
    return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {user && (
            <Avatar>
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
              <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
          )}
          <CardTitle>Create a post</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea placeholder="What's on your mind?" />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2">
        <div className="flex justify-around">
            <Button variant="ghost" size="sm">
                <ImagePlus className="mr-2 h-4 w-4" /> Photo
            </Button>
            <Button variant="ghost" size="sm">
                <Video className="mr-2 h-4 w-4" /> Video
            </Button>
        </div>
        <Button className="w-full">Post</Button>
      </CardFooter>
    </Card>
  );
}
